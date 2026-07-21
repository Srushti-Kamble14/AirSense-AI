"""Prediction routes for live AQI inference."""

from __future__ import annotations

from difflib import SequenceMatcher
import logging
import re

from fastapi import APIRouter, HTTPException, Query

from app.services import openaq_service, prediction_service, weather_service
from app.services.exceptions import ExternalAPIError
from app.services.prediction_service import PredictionServiceError


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/prediction", tags=["Prediction"])


def _station_name(location: dict) -> str:
    return location.get("station_name") or ""


def _normalize_station_text(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", " ", value.casefold()).strip()
    return re.sub(r"\s+", " ", normalized)


def _compact_station_text(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "", value.casefold())


def _station_match_score(query: str, station_name: str) -> float:
    query_normalized = _normalize_station_text(query)
    station_normalized = _normalize_station_text(station_name)
    query_compact = _compact_station_text(query)
    station_compact = _compact_station_text(station_name)

    if not query_normalized or (
        query_normalized not in station_normalized and query_compact not in station_compact
    ):
        return 0.0

    full_score = SequenceMatcher(None, query_normalized, station_normalized).ratio()
    compact_score = SequenceMatcher(None, query_compact, station_compact).ratio()
    token_scores = [
        SequenceMatcher(None, query_normalized, token).ratio()
        for token in station_normalized.split()
    ]
    return max([full_score, compact_score, *token_scores])


def _find_station(locations: list[dict], station: str) -> dict | None:
    matches = [(location, _station_match_score(station, _station_name(location))) for location in locations]
    matches = [(location, score) for location, score in matches if score > 0]
    if not matches:
        return None

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
    station_id = location.get("station_id")
    if station_id is None:
        raise HTTPException(status_code=404, detail="Station not found")

    merged = await openaq_service.get_merged_station_data(station_id)
    merged["latitude"] = location.get("latitude")
    merged["longitude"] = location.get("longitude")
    return merged


async def _get_city_air_quality(city: str) -> dict:
    locations = await openaq_service.get_locations_by_city(city)
    last_error: ExternalAPIError | None = None

    for location in locations:
        station_id = location.get("station_id")
        if station_id is None:
            continue

        try:
            merged = await _get_station_air_quality(location)
        except ExternalAPIError as exc:
            last_error = exc
            logger.warning("Skipping OpenAQ station %s: %s", station_id, exc.message)
            continue

        return merged

    if last_error:
        raise last_error
    raise HTTPException(status_code=404, detail=f"No usable air quality station found near '{city}'.")


async def _get_requested_air_quality(city: str, station: str | None) -> dict:
    if not station or not station.strip():
        return await _get_city_air_quality(city)

    locations = await openaq_service.get_locations_by_city(city)
    selected_location = _find_station(locations, station)
    if selected_location is None:
        raise HTTPException(status_code=404, detail="Station not found")

    return await _get_station_air_quality(selected_location)


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
    city: str | None = Query(None, description="City name, e.g. Delhi"),
    station: str | None = Query(None, description="Optional station name, e.g. Rohini"),
    place: str | None = Query(None, description="Any city, locality, landmark, road, or institution"),
    lat: float | None = Query(None),
    lon: float | None = Query(None),
    display_name: str | None = Query(None),
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
        "station": air_quality.get("station"),
        "weather": weather,
        "air_quality": air_quality,
        "prediction": {
            "predicted_aqi": prediction["predicted_aqi"],
            "category": prediction["category"],
        },
        "health_advisory": prediction["health_advisory"],
    }
