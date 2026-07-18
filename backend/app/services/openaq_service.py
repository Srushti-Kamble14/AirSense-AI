"""
OpenAQ integration service.

OpenAQ v3 (the only live version — v1/v2 were retired Jan 2025) does not
support a free-text "city" query param. It only supports geospatial queries
(coordinates + radius, or bbox). So the flow for "get stations for a city" is:

    1. Geocode the city name -> (lat, lon)   [via OpenStreetMap Nominatim]
    2. Query OpenAQ /v3/locations?coordinates=lat,lon&radius=...
    3. For each location, sensors are already included in the response
    4. For latest merged pollutant values, call /v3/locations/{id}/latest

Nothing here touches the database — pure fetch/process/return, per the task.
"""
from typing import Any

import httpx

from app.core.config import get_settings
from app.services.exceptions import (
    CityNotFoundError,
    InvalidAPIKeyError,
    NoStationsFoundError,
    SensorNotFoundError,
    StationNotFoundError,
    UpstreamServiceError,
    UpstreamTimeoutError,
)

settings = get_settings()

# Maps OpenAQ's internal parameter names to the flat keys our API returns
PARAMETER_KEY_MAP = {
    "pm25": "pm25",
    "pm10": "pm10",
    "no2": "no2",
    "so2": "so2",
    "co": "co",
    "o3": "o3",
}


async def _geocode_city(city: str) -> dict[str, float]:
    """Resolve a city name to latitude/longitude using OpenStreetMap Nominatim."""
    params = {"q": city, "format": "json", "limit": 1}
    headers = {"User-Agent": settings.NOMINATIM_USER_AGENT}

    try:
        async with httpx.AsyncClient(timeout=settings.HTTP_TIMEOUT_SECONDS) as client:
            resp = await client.get(
                f"{settings.NOMINATIM_BASE_URL}/search", params=params, headers=headers
            )
    except httpx.TimeoutException:
        raise UpstreamTimeoutError("Geocoding")
    except httpx.RequestError as exc:
        raise UpstreamServiceError("Geocoding", str(exc))

    if resp.status_code != 200:
        raise UpstreamServiceError("Geocoding", f"status {resp.status_code}")

    results = resp.json()
    if not results:
        raise CityNotFoundError(city)

    return {"lat": float(results[0]["lat"]), "lon": float(results[0]["lon"])}


def _build_headers() -> dict[str, str]:
    print("=" * 50)
    print("OPENAQ_API_KEY =", repr(settings.OPENAQ_API_KEY))
    print("=" * 50)

    if not settings.OPENAQ_API_KEY:
        raise InvalidAPIKeyError("OpenAQ")

    return {
        "X-API-Key": settings.OPENAQ_API_KEY
    }
    print("API key loaded:", bool(settings.OPENAQ_API_KEY))
    print("API key value:", repr(settings.OPENAQ_API_KEY))

    if not settings.OPENAQ_API_KEY:
        raise InvalidAPIKeyError("OpenAQ")

    return {"X-API-Key": settings.OPENAQ_API_KEY}
    print("API key loaded:", bool(settings.OPENAQ_API_KEY))
    print("API key:", settings.OPENAQ_API_KEY)

    if not settings.OPENAQ_API_KEY:
        raise InvalidAPIKeyError("OpenAQ")

    return {
        "X-API-Key": settings.OPENAQ_API_KEY
    }


async def _openaq_get(path: str, params: dict[str, Any] | None = None) -> dict:
    """Shared helper for calling any OpenAQ v3 endpoint with consistent error handling."""
    headers = _build_headers()
    url = f"{settings.OPENAQ_BASE_URL}{path}"

    try:
        async with httpx.AsyncClient(timeout=settings.HTTP_TIMEOUT_SECONDS) as client:
            resp = await client.get(url, params=params, headers=headers)
    except httpx.TimeoutException:
        raise UpstreamTimeoutError("OpenAQ")
    except httpx.RequestError as exc:
        raise UpstreamServiceError("OpenAQ", str(exc))

    if resp.status_code == 401:
        raise InvalidAPIKeyError("OpenAQ")
    if resp.status_code == 404:
        raise UpstreamServiceError("OpenAQ", "resource not found")
    if resp.status_code >= 400:
        raise UpstreamServiceError("OpenAQ", f"status {resp.status_code}: {resp.text[:200]}")

    return resp.json()


def _serialize_location(location: dict) -> dict:
    """Turn a raw OpenAQ location object into our clean station shape."""
    sensors = location.get("sensors", [])
    available_sensors = [
        s["parameter"]["displayName"] for s in sensors if s.get("parameter")
    ]
    coords = location.get("coordinates") or {}

    return {
        "station_name": location.get("name"),
        "station_id": location.get("id"),
        "latitude": coords.get("latitude"),
        "longitude": coords.get("longitude"),
        "provider": (location.get("provider") or {}).get("name"),
        "available_sensors": available_sensors,
        "sensors": [
            {
                "sensor_id": s.get("id"),
                "parameter": (s.get("parameter") or {}).get("name"),
                "display_name": (s.get("parameter") or {}).get("displayName"),
                "unit": (s.get("parameter") or {}).get("units"),
            }
            for s in sensors
        ],
    }


async def get_locations_by_city(city: str, radius_meters: int = 25000) -> list[dict]:
    """
    Step 1 + 2 of the task: geocode the city, then fetch monitoring stations
    within `radius_meters` (OpenAQ's max allowed radius is 25,000m / 25km).
    """
    coords = await _geocode_city(city)

    data = await _openaq_get(
        "/locations",
        params={
            "coordinates": f"{coords['lat']},{coords['lon']}",
            "radius": min(radius_meters, 25000),
            "limit": 100,
        },
    )

    results = data.get("results", [])
    if not results:
        raise NoStationsFoundError(city)

    return [_serialize_location(loc) for loc in results]


async def get_station_by_id(station_id: int) -> dict:
    """Fetch a single monitoring station (with its sensors) by OpenAQ location id."""
    data = await _openaq_get(f"/locations/{station_id}")
    results = data.get("results", [])
    if not results:
        raise StationNotFoundError(station_id)

    return _serialize_location(results[0])


async def get_sensor_measurement(sensor_id: int) -> dict:
    """
    Step 3 of the task: latest value, unit, and timestamp for one sensor.
    Uses /v3/sensors/{id}/measurements sorted to the most recent single reading.
    """
    data = await _openaq_get(
        f"/sensors/{sensor_id}/measurements",
        params={"limit": 1, "page": 1},
    )
    results = data.get("results", [])
    if not results:
        raise SensorNotFoundError(sensor_id)

    latest = results[0]
    period = latest.get("period", {})

    return {
        "sensor_id": sensor_id,
        "parameter": (latest.get("parameter") or {}).get("name"),
        "value": latest.get("value"),
        "unit": (latest.get("parameter") or {}).get("units"),
        "timestamp": (period.get("datetimeTo") or {}).get("utc")
        or (period.get("datetimeFrom") or {}).get("utc"),
    }


async def get_merged_station_data(station_id: int) -> dict:
    """
    Step 4 of the task: merge every pollutant reading for a station into
    a single flat object, using OpenAQ's per-location "latest" endpoint
    (one call instead of one call per sensor).
    """
    station = await get_station_by_id(station_id)
    sensor_by_id = {s["sensor_id"]: s for s in station["sensors"]}

    latest_data = await _openaq_get(f"/locations/{station_id}/latest")
    latest_results = latest_data.get("results", [])

    merged: dict[str, Any] = {"station": station["station_name"], "station_id": station_id}
    recorded_at = None

    for entry in latest_results:
        sensor_id = entry.get("sensorsId")
        sensor_meta = sensor_by_id.get(sensor_id)
        if not sensor_meta:
            continue

        param_key = PARAMETER_KEY_MAP.get(sensor_meta["parameter"], sensor_meta["parameter"])
        merged[param_key] = entry.get("value")

        dt = entry.get("datetime", {}).get("utc")
        if dt:
            recorded_at = dt

    merged["recorded_at"] = recorded_at
    return merged