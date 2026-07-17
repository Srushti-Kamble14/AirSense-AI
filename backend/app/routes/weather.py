"""
FastAPI routes for OpenWeatherMap integration.

    GET /weather/current?city=Delhi
    GET /weather/forecast?city=Delhi

Also accepts lat/lon instead of city, since your Location model already
stores coordinates and you'll want that path once locations are saved to DB.
"""
from fastapi import APIRouter, HTTPException, Query

from app.services import weather_service
from app.services.exceptions import ExternalAPIError

router = APIRouter(prefix="/weather", tags=["Weather"])


@router.get("/current")
async def current_weather(
    city: str | None = Query(None, description="City name, e.g. Delhi"),
    lat: float | None = Query(None),
    lon: float | None = Query(None),
):
    if not city and (lat is None or lon is None):
        raise HTTPException(status_code=400, detail="Provide either 'city' or both 'lat' and 'lon'.")

    try:
        return await weather_service.get_current_weather(city=city, lat=lat, lon=lon)
    except ExternalAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.get("/forecast")
async def weather_forecast(
    city: str | None = Query(None, description="City name, e.g. Delhi"),
    lat: float | None = Query(None),
    lon: float | None = Query(None),
):
    if not city and (lat is None or lon is None):
        raise HTTPException(status_code=400, detail="Provide either 'city' or both 'lat' and 'lon'.")

    try:
        return await weather_service.get_weather_forecast(city=city, lat=lat, lon=lon)
    except ExternalAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)