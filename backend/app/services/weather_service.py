"""
OpenWeatherMap integration service.

Uses the free-tier endpoints:
    /data/2.5/weather   -> current weather
    /data/2.5/forecast  -> 5 day / 3-hour interval forecast

Nothing is stored in the database here - pure fetch/process/return.
"""
import asyncio
from typing import Any

import httpx

from app.core.config import get_settings
from app.services.exceptions import (
    CityNotFoundError,
    InvalidAPIKeyError,
    UpstreamServiceError,
    UpstreamTimeoutError,
)

settings = get_settings()

UPSTREAM_RETRY_ATTEMPTS = 2
UPSTREAM_RETRY_BACKOFF_SECONDS = 0.35
RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}


def _http_timeout() -> httpx.Timeout:
    total = min(float(settings.HTTP_TIMEOUT_SECONDS), 6.0)
    return httpx.Timeout(total, connect=min(total, 2.5), read=total, write=3.0, pool=3.0)


async def _get_with_retries(path: str, params: dict[str, Any]) -> httpx.Response:
    url = f"{settings.OPENWEATHER_BASE_URL}{path}"
    last_error: Exception | None = None

    for attempt in range(UPSTREAM_RETRY_ATTEMPTS + 1):
        try:
            async with httpx.AsyncClient(timeout=_http_timeout()) as client:
                resp = await client.get(url, params=params)

            if resp.status_code not in RETRYABLE_STATUS_CODES or attempt == UPSTREAM_RETRY_ATTEMPTS:
                return resp
        except httpx.TimeoutException as exc:
            last_error = exc
            if attempt == UPSTREAM_RETRY_ATTEMPTS:
                raise UpstreamTimeoutError("OpenWeatherMap") from exc
        except httpx.RequestError as exc:
            last_error = exc
            if attempt == UPSTREAM_RETRY_ATTEMPTS:
                raise UpstreamServiceError("OpenWeatherMap", str(exc)) from exc

        await asyncio.sleep(UPSTREAM_RETRY_BACKOFF_SECONDS * (attempt + 1))

    if isinstance(last_error, httpx.TimeoutException):
        raise UpstreamTimeoutError("OpenWeatherMap")
    if last_error:
        raise UpstreamServiceError("OpenWeatherMap", str(last_error))
    raise UpstreamServiceError("OpenWeatherMap", "retry attempts exhausted")


async def _owm_get(path: str, params: dict[str, Any]) -> dict:
    if not settings.OPENWEATHER_API_KEY:
        raise InvalidAPIKeyError("OpenWeatherMap")

    params = {**params, "appid": settings.OPENWEATHER_API_KEY, "units": "metric"}
    resp = await _get_with_retries(path, params)

    if resp.status_code == 401:
        raise InvalidAPIKeyError("OpenWeatherMap")
    if resp.status_code == 404:
        raise CityNotFoundError(params.get("q", "unknown"))
    if resp.status_code in RETRYABLE_STATUS_CODES:
        raise UpstreamTimeoutError("OpenWeatherMap")
    if resp.status_code >= 400:
        raise UpstreamServiceError("OpenWeatherMap", f"status {resp.status_code}: {resp.text[:200]}")

    data = resp.json()
    if not data:
        raise UpstreamServiceError("OpenWeatherMap", "empty response")

    return data


def _location_params(city: str | None, lat: float | None, lon: float | None) -> dict:
    if city:
        return {"q": city}
    if lat is not None and lon is not None:
        return {"lat": lat, "lon": lon}
    raise ValueError("Either city or (lat, lon) must be provided.")


async def get_current_weather(
    city: str | None = None, lat: float | None = None, lon: float | None = None
) -> dict:
    """Step 1: current weather for a city name or coordinates."""
    data = await _owm_get("/weather", _location_params(city, lat, lon))

    main = data.get("main", {})
    wind = data.get("wind", {})
    weather_list = data.get("weather", [])
    condition = weather_list[0]["main"] if weather_list else None

    return {
        "city": data.get("name"),
        "temperature": main.get("temp"),
        "humidity": main.get("humidity"),
        "pressure": main.get("pressure"),
        "wind_speed": wind.get("speed"),
        "wind_direction": wind.get("deg"),
        "visibility": data.get("visibility"),
        "condition": condition,
        "timestamp": data.get("dt"),
    }


async def get_weather_forecast(
    city: str | None = None, lat: float | None = None, lon: float | None = None
) -> list[dict]:
    """Step 2: 5-day forecast in 3-hour intervals, trimmed to required fields."""
    data = await _owm_get("/forecast", _location_params(city, lat, lon))

    forecast_list = data.get("list", [])
    parsed = []
    for entry in forecast_list:
        main = entry.get("main", {})
        wind = entry.get("wind", {})
        weather_list = entry.get("weather", [])
        condition = weather_list[0]["main"] if weather_list else None

        parsed.append(
            {
                "forecast_time": entry.get("dt_txt"),
                "temperature": main.get("temp"),
                "humidity": main.get("humidity"),
                "wind_speed": wind.get("speed"),
                "condition": condition,
            }
        )

    return parsed