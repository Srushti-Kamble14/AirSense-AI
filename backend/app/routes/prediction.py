"""Prediction routes for live AQI inference."""

from __future__ import annotations

import logging
import re
from difflib import SequenceMatcher

from fastapi import APIRouter, HTTPException, Query

from app.services import openaq_service, prediction_service, weather_service
from app.services.exceptions import ExternalAPIError
from app.services.prediction_service import PredictionServiceError

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/prediction", tags=["Prediction"])


def _station_name(location: dict) -> str:
    return location.get("station_name") or location.get("name") or ""


def _clean_station_query(station_query: str, city: str) -> str:
    """Removes the city suffix if passed in station name (e.g., 'Civil Lines, Delhi' -> 'Civil Lines')."""
    station_query = re.sub(
        rf"\b{re.escape(city)}\b", "", station_query, flags=re.IGNORECASE
    )
    return station_query.strip(" ,-")


def _normalize_station_text(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()
    return re.sub(r"\s+", " ", normalized)


def _compact_station_text(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.casefold())


def _station_match_score(query: str, station_name: str) -> float:
    query_norm = _normalize_station_text(query)
    station_norm = _normalize_station_text(station_name)

    if not query_norm or not station_norm:
        return 0.0

    # Token overlap check (e.g. "Civil" and "Lines")
    query_tokens = set(query_norm.split())
    station_tokens = set(station_norm.split())
    overlap = len(query_tokens & station_tokens)

    if overlap > 0:
        token_ratio = overlap / max(len(query_tokens), 1)
        seq_ratio = SequenceMatcher(None, query_norm, station_norm).ratio()
        return max(token_ratio, seq_ratio)

    return SequenceMatcher(None, _compact_station_text(query), _compact_station_text(station_name)).ratio()


def _find_station(locations: list[dict], station_query: str, city: str) -> dict | None:
    cleaned_query = _clean_station_query(station_query, city)
    target_query = cleaned_query if cleaned_query else station_query

    matches = []
    for loc in locations:
        st_name = _station_name(loc)
        score = _station_match_score(target_query, st_name)
        if score > 0.2:  # Relaxed threshold for sub-locations
            matches.append((loc, score))

    if not matches:
        return None

    # Return location with highest fuzzy score
    return max(matches, key=lambda item: item[1])[0]


def _station_response(location: dict) -> dict:
    return {
        "name": location.get("station_name") or location.get("station"),
        "provider": location.get("provider"),
        "distance_km": location.get("distance_km"),
        "latitude": location.get("latitude"),
        "longitude": location.get("longitude"),
        "station_id": location.get("station_id"),
    }


def _confidence(distance_km: float | None) -> dict:
    if distance_km is None:
        return {"score": 0, "label": "Unknown", "stars": "-----"}
    if distance_km <= 2:
        return {"score": 5, "label": "High", "stars": "*****"}
    if distance_km <= 5:
        return {"score": 4, "label": "Good", "stars": "****-"}
    if distance_km <= 10:
        return {"score": 3, "label": "Moderate", "stars": "***--"}
    if distance_km <= 20:
        return {"score": 2, "label": "Low", "stars": "**---"}
    return {"score": 1, "label": "Very low", "stars": "*----"}


async def _get_station_air_quality(location: dict) -> dict:
    station_id = location.get("station_id") or location.get("id")
    if station_id is None:
        raise HTTPException(status_code=404, detail="Station ID missing")

    merged = await openaq_service.get_merged_station_data(station_id)
    merged["latitude"] = location.get("latitude")
    merged["longitude"] = location.get("longitude")
    return merged


async def _get_city_air_quality(city: str) -> dict:
    locations = await openaq_service.get_locations_by_city(city)
    last_error: ExternalAPIError | None = None

    for location in locations:
        station_id = location.get("station_id") or location.get("id")
        if station_id is None:
            continue

        try:
            return await _get_station_air_quality(location)
        except ExternalAPIError as exc:
            last_error = exc
            logger.warning("Skipping OpenAQ station %s: %s", station_id, exc.message)
            continue

    if last_error:
        raise last_error
    raise HTTPException(status_code=404, detail=f"No usable air quality station found near '{city}'.")


async def _get_requested_air_quality(city: str, station: str | None) -> dict:
    if not station or not station.strip():
        return await _get_city_air_quality(city)

    locations = await openaq_service.get_locations_by_city(city)
    selected_location = _find_station(locations, station, city)

    # Fallback to city-wide station if specific station isn't matched
    if selected_location is None:
        logger.info("Station '%s' not found in %s, falling back to city average.", station, city)
        return await _get_city_air_quality(city)

    try:
        return await _get_station_air_quality(selected_location)
    except Exception:
        # Fallback to city if specific station data fetch fails
        return await _get_city_air_quality(city)


def _searched_location(place: dict) -> dict:
    return {
        "name": place.get("name") or place.get("display_name"),
        "display_name": place.get("display_name") or place.get("name"),
        "latitude": place.get("latitude"),
        "longitude": place.get("longitude"),
        "city": place.get("city"),
        "state": place.get("state"),
        "country": place.get("country"),
    }


async def _predict_place(place: str, lat: float | None, lon: float | None, display_name: str | None) -> dict:
    if lat is not None and lon is not None:
        searched = {
            "name": place,
            "display_name": display_name or place,
            "latitude": lat,
            "longitude": lon,
            "city": None,
            "state": None,
            "country": None,
        }
    else:
        searched = (await openaq_service.geocode_place(place, limit=1))[0]

    locations = await openaq_service.get_locations_near_coords(
        searched["latitude"],
        searched["longitude"],
        searched.get("name") or place,
    )
    nearest = openaq_service.nearest_station(searched, locations)
    if nearest is None:
        raise HTTPException(status_code=404, detail="No monitoring station found nearby.")

    air_quality = await _get_station_air_quality(nearest)
    weather = await weather_service.get_current_weather(lat=searched["latitude"], lon=searched["longitude"])
    prediction = prediction_service.predict(weather, air_quality)
    confidence = _confidence(nearest.get("distance_km"))

    return {
        "searched_location": _searched_location(searched),
        "nearest_station": _station_response(nearest),
        "weather": weather,
        "air_quality": air_quality,
        "prediction": {
            "predicted_aqi": prediction["predicted_aqi"],
            "category": prediction["category"],
        },
        "health_advisory": prediction["health_advisory"],
        "confidence": confidence,
        "notice": "Prediction is based on the nearest available station and may be less representative."
        if (nearest.get("distance_km") or 0) > 20
        else None,
    }


@router.get("")
async def predict_city_aqi(
    city: str = Query(..., description="City name, e.g. Delhi"),
    station: str | None = Query(None, description="Optional station name, e.g. Civil Lines"),
):
    try:
        if place:
            return await _predict_place(place, lat, lon, display_name)

        if not city:
            raise HTTPException(status_code=422, detail="Provide either 'place' or 'city'.")

        weather = await weather_service.get_current_weather(city=city)
        air_quality = await _get_requested_air_quality(city, station)
        prediction = prediction_service.predict(weather, air_quality)
    except ExternalAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except PredictionServiceError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return {
        "city": city,
        "station": air_quality.get("station") or station or city,
        "weather": weather,
        "air_quality": air_quality,
        "prediction": {
            "predicted_aqi": prediction["predicted_aqi"],
            "category": prediction["category"],
        },
        "health_advisory": prediction["health_advisory"],
    }