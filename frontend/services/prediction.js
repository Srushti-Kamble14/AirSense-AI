import { apiRequest } from "./api";

export function getPrediction({ city, station }, options = {}) {
  return apiRequest("/prediction", {
    ...options,
    params: { city, station },
    retries: options.retries ?? 1,
  });
}
