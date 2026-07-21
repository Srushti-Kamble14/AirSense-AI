"""
OpenAQ integration service.

OpenAQ v3 is queried by coordinates, so this module owns geocoding,
station lookup, latest pollutant reads, and nearest-station distance logic.
Nothing here touches the database or ML artifacts.
"""
from datetime import datetime, timedelta
from math import asin, cos, radians, sin, sqrt
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

PARAMETER_KEY_MAP = {
    "pm25": "pm25",
    "pm10": "pm10",
    "no2": "no2",
    "so2": "so2",
    "co": "co",
    "o3": "o3",
}

GEOCODE_CACHE_TTL = timedelta(minutes=30)
STATION_CACHE_TTL = timedelta(minutes=10)
_geocode_cache: dict[str, tuple[datetime, Any]] = {}
_station_cache: dict[str, tuple[datetime, Any]] = {}


def _cache_get(cache: dict[str, tuple[datetime, Any]], key: str, ttl: timedelta) -> Any | None:
    item = cache.get(key)
    if not item:
        return None

    stored_at, value = item
    if datetime.utcnow() - stored_at > ttl:
        cache.pop(key, None)
        return None

    return value


def _cache_set(cache: dict[str, tuple[datetime, Any]], key: str, value: Any) -> Any:
    cache[key] = (datetime.utcnow(), value)
    return value


def _cache_key(*parts: object) -> str:
    return "|".join(str(part).strip().casefold() for part in parts)


def _serialize_place(result: dict) -> dict:
    address = result.get("address") or {}
    city = (
        address.get("city")
        or address.get("town")
        or address.get("village")
        or address.get("municipality")
        or address.get("county")
    )

    return {
        "name": result.get("name") or result.get("display_name"),
        "display_name": result.get("display_name"),
        "latitude": float(result["lat"]),
        "longitude": float(result["lon"]),
        "city": city,
        "state": address.get("state"),
        "country": address.get("country"),
    }


async def geocode_place(query: str, limit: int = 1) -> list[dict]:
    """Resolve a free-text place query using OpenStreetMap Nominatim."""
    cleaned = query.strip()
    if not cleaned:
        return []

    limit = max(1, min(limit, 8))
    key = _cache_key("geocode", cleaned, limit)
    cached = _cache_get(_geocode_cache, key, GEOCODE_CACHE_TTL)
    if cached is not None:
        return cached

    params = {"q": cleaned, "format": "json", "addressdetails": 1, "limit": limit}
    headers = {"User-Agent": settings.NOMINATIM_USER_AGENT}

    try:
        async with httpx.AsyncClient(timeout=settings.HTTP_TIMEOUT_SECONDS) as client:
            resp = await client.get(f"{settings.NOMINATIM_BASE_URL}/search", params=params, headers=headers)
    except httpx.TimeoutException:
        raise UpstreamTimeoutError("Geocoding")
    except httpx.RequestError as exc:
        raise UpstreamServiceError("Geocoding", str(exc))

    if resp.status_code != 200:
        raise UpstreamServiceError("Geocoding", f"status {resp.status_code}")

    results = resp.json()
    places = [_serialize_place(result) for result in results if result.get("lat") and result.get("lon")]
    if not places:
        raise CityNotFoundError(cleaned)

    return _cache_set(_geocode_cache, key, places)


async def _geocode_city(city: str) -> dict[str, float]:
    """Resolve a city name to latitude/longitude using OpenStreetMap Nominatim."""
    places = await geocode_place(city, limit=1)
    return {"lat": places[0]["latitude"], "lon": places[0]["longitude"]}


def _build_headers() -> dict[str, str]:
    if not settings.OPENAQ_API_KEY:
        raise InvalidAPIKeyError("OpenAQ")
    return {"X-API-Key": settings.OPENAQ_API_KEY}


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
    available_sensors = [s["parameter"]["displayName"] for s in sensors if s.get("parameter")]
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
    coords = await _geocode_city(city)
    return await get_locations_near_coords(coords["lat"], coords["lon"], city, radius_meters)


async def get_locations_near_coords(lat: float, lon: float, label: str = "selected location", radius_meters: int = 25000) -> list[dict]:
    """Fetch OpenAQ monitoring stations around a coordinate pair."""
    radius = min(radius_meters, 25000)
    key = _cache_key("stations", round(lat, 4), round(lon, 4), radius)
    cached = _cache_get(_station_cache, key, STATION_CACHE_TTL)
    if cached is not None:
        return cached

    data = await _openaq_get(
        "/locations",
        params={"coordinates": f"{lat},{lon}", "radius": radius, "limit": 100},
    )

    results = data.get("results", [])
    if not results:
        raise NoStationsFoundError(label)

    return _cache_set(_station_cache, key, [_serialize_location(loc) for loc in results])


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance between two points in kilometers."""
    radius_km = 6371.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 2 * radius_km * asin(sqrt(a))


def nearest_station(place: dict, locations: list[dict]) -> dict | None:
    """Pick the closest station to a serialized place."""
    place_lat = place.get("latitude")
    place_lon = place.get("longitude")
    if place_lat is None or place_lon is None:
        return None

    candidates = []
    for location in locations:
        station_lat = location.get("latitude")
        station_lon = location.get("longitude")
        if station_lat is None or station_lon is None:
            continue

        distance = haversine_km(float(place_lat), float(place_lon), float(station_lat), float(station_lon))
        candidates.append(({**location, "distance_km": round(distance, 2)}, distance))

    if not candidates:
        return None

    return min(candidates, key=lambda item: item[1])[0]


async def get_station_by_id(station_id: int) -> dict:
    """Fetch a single monitoring station (with its sensors) by OpenAQ location id."""
    data = await _openaq_get(f"/locations/{station_id}")
    results = data.get("results", [])
    if not results:
        raise StationNotFoundError(station_id)

    return _serialize_location(results[0])


async def get_sensor_measurement(sensor_id: int) -> dict:
    """Fetch the latest value, unit, and timestamp for one sensor."""
    data = await _openaq_get(f"/sensors/{sensor_id}/measurements", params={"limit": 1, "page": 1})
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
        "timestamp": (period.get("datetimeTo") or {}).get("utc") or (period.get("datetimeFrom") or {}).get("utc"),
    }


async def get_merged_station_data(station_id: int) -> dict:
    """Merge latest pollutant readings for a station into a single flat object."""
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
