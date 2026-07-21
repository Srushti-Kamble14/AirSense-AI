"""Prediction routes for live AQI inference."""

from __future__ import annotations

from difflib import SequenceMatcher
import logging

from fastapi import APIRouter, HTTPException, Query

from app.services import openaq_service, prediction_service, weather_service
from app.services.exceptions import ExternalAPIError
from app.services.prediction_service import PredictionServiceError


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/prediction", tags=["Prediction"])


def _station_name(location: dict) -> str:
    return location.get("station_name") or ""


def _station_match_score(query: str, station_name: str) -> float:
    query_normalized = query.casefold().strip()
    station_normalized = station_name.casefold()

    if not query_normalized or query_normalized not in station_normalized:
        return 0.0

    full_score = SequenceMatcher(None, query_normalized, station_normalized).ratio()
    token_scores = [
        SequenceMatcher(None, query_normalized, token).ratio()
        for token in station_normalized.replace("-", " ").replace(",", " ").split()
    ]
    return max([full_score, *token_scores])


def _find_station(locations: list[dict], station: str) -> dict | None:
    matches = [
        (location, _station_match_score(station, _station_name(location)))
        for location in locations
    ]
    matches = [(location, score) for location, score in matches if score > 0]
    if not matches:
        return None

    return max(matches, key=lambda item: item[1])[0]


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


@router.get("")
async def predict_city_aqi(
    city: str = Query(..., description="City name, e.g. Delhi"),
    station: str | None = Query(None, description="Optional station name, e.g. Rohini"),
):
    try:
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
