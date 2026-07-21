"use client";

import { useEffect, useRef } from "react";

function predictionUrl(apiBaseUrl, location) {
  const params = new URLSearchParams();

  if (location.type === "place") {
    params.set("place", location.label || location.displayName || location.city);
    if (location.latitude !== null && location.latitude !== undefined) params.set("lat", location.latitude);
    if (location.longitude !== null && location.longitude !== undefined) params.set("lon", location.longitude);
    if (location.displayName) params.set("display_name", location.displayName);
    return `${apiBaseUrl}/prediction?${params.toString()}`;
  }

  params.set("city", location.city);
  if (location.type === "station" && location.station) params.set("station", location.station);
  return `${apiBaseUrl}/prediction?${params.toString()}`;
}

export function PredictionUpdater({ apiBaseUrl, location, onLoading, onPrediction, onError }) {
  const abortRef = useRef(null);

  useEffect(() => {
    if (!location?.city && !location?.label) return undefined;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    onLoading?.(true);
    onError?.(null);

    fetch(predictionUrl(apiBaseUrl, location), { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.detail || "Unable to fetch prediction.");
        return payload;
      })
      .then((payload) => {
        if (!controller.signal.aborted) onPrediction?.(payload);
      })
      .catch((error) => {
        if (error.name !== "AbortError") onError?.(error.message || "Unable to fetch prediction.");
      })
      .finally(() => {
        if (!controller.signal.aborted) onLoading?.(false);
      });

    return () => controller.abort();
  }, [apiBaseUrl, location, onError, onLoading, onPrediction]);

  return null;
}
