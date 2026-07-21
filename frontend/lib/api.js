const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function apiFetch(path, { params, ...options } = {}) {
  const url = new URL(path, API_BASE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });
  }

  let res;
  try {
    res = await fetch(url.toString(), options);
  } catch (err) {
    // backend down / CORS / network issue
    throw new ApiError(`Cannot reach backend: ${err.message}`, 0);
  }

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(body?.detail || `Request failed (${res.status})`, res.status);
  }

  return body;
}

// GET /health
export function getHealth() {
  return apiFetch("/health");
}

// GET /weather/current?city= | ?lat=&lon=
export function getWeatherCurrent({ city, lat, lon } = {}) {
  return apiFetch("/weather/current", { params: { city, lat, lon } });
}

// GET /weather/forecast?city= | ?lat=&lon=
export function getWeatherForecast({ city, lat, lon } = {}) {
  return apiFetch("/weather/forecast", { params: { city, lat, lon } });
}

// GET /openaq/locations?city=
export function getOpenAqLocations(city) {
  return apiFetch("/openaq/locations", { params: { city } });
}

// GET /openaq/stations/{station_id}
export function getOpenAqStation(stationId) {
  return apiFetch(`/openaq/stations/${stationId}`);
}

// GET /openaq/stations/{station_id}/merged
export function getOpenAqStationMerged(stationId) {
  return apiFetch(`/openaq/stations/${stationId}/merged`);
}

// GET /openaq/measurements/{sensor_id}
export function getOpenAqMeasurement(sensorId) {
  return apiFetch(`/openaq/measurements/${sensorId}`);
}

// GET /prediction?city=&station=
export function getPrediction({ city, station } = {}) {
  return apiFetch("/prediction", { params: { city, station } });
}