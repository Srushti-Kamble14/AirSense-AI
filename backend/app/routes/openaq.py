"""
FastAPI routes for OpenAQ integration.

    GET /openaq/locations?city=Delhi        -> stations near a city
    GET /openaq/stations/{station_id}       -> single station + its sensors
    GET /openaq/measurements/{sensor_id}    -> latest reading for one sensor
    GET /openaq/stations/{station_id}/merged -> all pollutants merged (bonus,
                                                  matches the task's "Merge Data" example)

No database writes happen here — fetch, process, return only.
"""
from fastapi import APIRouter, HTTPException, Query

from app.services import openaq_service
from app.services.exceptions import ExternalAPIError

router = APIRouter(prefix="/openaq", tags=["OpenAQ - Air Quality"])


@router.get("/locations")
async def get_locations(city: str = Query(..., description="City name, e.g. Delhi")):
    try:
        return await openaq_service.get_locations_by_city(city)
    except ExternalAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.get("/stations/{station_id}")
async def get_station(station_id: int):
    try:
        return await openaq_service.get_station_by_id(station_id)
    except ExternalAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.get("/stations/{station_id}/merged")
async def get_station_merged(station_id: int):
    try:
        return await openaq_service.get_merged_station_data(station_id)
    except ExternalAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)


@router.get("/measurements/{sensor_id}")
async def get_measurement(sensor_id: int):
    try:
        return await openaq_service.get_sensor_measurement(sensor_id)
    except ExternalAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)