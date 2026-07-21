import { apiRequest } from "./api";

export function getLocations(city, options = {}) {
  return apiRequest("/locations", {
    ...options,
    params: { city },
    retries: options.retries ?? 1,
  });
}
