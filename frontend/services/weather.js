import { apiRequest } from "./api";

export function getCurrentWeather({ city, lat, lon }, options = {}) {
  return apiRequest("/weather/current", {
    ...options,
    params: { city, lat, lon },
    retries: options.retries ?? 1,
  });
}

export function getWeatherForecast({ city, lat, lon }, options = {}) {
  return apiRequest("/weather/forecast", {
    ...options,
    params: { city, lat, lon },
    retries: options.retries ?? 1,
  });
}
