"""Prediction routes for live AQI inference."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query

from app.services import openaq_service, prediction_service, weather_service
from app.services.exceptions import ExternalAPIError
from app.services.prediction_service import PredictionServiceError


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/prediction", tags=["Prediction"])


async def _get_city_air_quality(city: str) -> dict:
    locations = await openaq_service.get_locations_by_city(city)
    last_error: ExternalAPIError | None = None

    for location in locations:
        station_id = location.get("station_id")
        if station_id is None:
            continue

        try:
            merged = await openaq_service.get_merged_station_data(station_id)
        except ExternalAPIError as exc:
            last_error = exc
            logger.warning("Skipping OpenAQ station %s: %s", station_id, exc.message)
            continue

        merged["latitude"] = location.get("latitude")
        merged["longitude"] = location.get("longitude")
        return merged

    if last_error:
        raise last_error
    raise HTTPException(status_code=404, detail=f"No usable air quality station found near '{city}'.")


@router.get("")
async def predict_city_aqi(city: str = Query(..., description="City name, e.g. Delhi")):
    try:
        weather = await weather_service.get_current_weather(city=city)
        air_quality = await _get_city_air_quality(city)
        prediction = prediction_service.predict(weather, air_quality)
    except ExternalAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)
    except PredictionServiceError as exc:
        raise HTTPException(status_code=500, detail=str(exc))

    return {
        "city": city,
        "weather": weather,
        "air_quality": air_quality,
        "prediction": {
            "predicted_aqi": prediction["predicted_aqi"],
            "category": prediction["category"],
        },
        "health_advisory": prediction["health_advisory"],
    }
