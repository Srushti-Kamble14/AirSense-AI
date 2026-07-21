"""Public location routes for frontend station discovery."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query

from app.services import openaq_service
from app.services.exceptions import ExternalAPIError


router = APIRouter(prefix="/locations", tags=["Locations"])


def _normalize_key_part(value: object) -> str:
    return str(value or "").strip().casefold()


def _clean_station_name(station_name: str | None) -> str:
    if not station_name:
        return ""

    name = station_name.split(",", 1)[0].strip()
    return name.split(" - ", 1)[0].strip()


def _provider_name(location: dict) -> str | None:
    provider = location.get("provider")
    if provider:
        return provider

    station_name = location.get("station_name") or ""
    if " - " in station_name:
        return station_name.rsplit(" - ", 1)[-1].strip()

    return None


def _station_key(location: dict, city: str) -> tuple[str, str, float | None, float | None]:
    latitude = location.get("latitude")
    longitude = location.get("longitude")

    return (
        _normalize_key_part(_clean_station_name(location.get("station_name"))),
        _normalize_key_part(city),
        round(float(latitude), 6) if latitude is not None else None,
        round(float(longitude), 6) if longitude is not None else None,
    )


def _serialize_station(location: dict, city: str) -> dict:
    return {
        "station_id": location.get("station_id"),
        "station": _clean_station_name(location.get("station_name")),
        "city": city,
        "latitude": location.get("latitude"),
        "longitude": location.get("longitude"),
        "provider": _provider_name(location),
    }


@router.get("")
async def get_locations(city: str = Query(..., description="City name, e.g. Delhi")):
    try:
        locations = await openaq_service.get_locations_by_city(city)
    except ExternalAPIError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message)

    seen: set[tuple[str, str, float | None, float | None]] = set()
    stations = []
    for location in locations:
        key = _station_key(location, city)
        if key in seen:
            continue

        seen.add(key)
        stations.append(_serialize_station(location, city))

    return stations