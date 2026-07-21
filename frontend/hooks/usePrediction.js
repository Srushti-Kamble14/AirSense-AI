"use client";

import { useCallback, useEffect, useState } from "react";
import { getPrediction } from "@/services/prediction";

export function usePrediction(location) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(
    async ({ signal } = {}) => {
      if (!location?.city) {
        setData(null);
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const payload = await getPrediction(
          {
            city: location.city,
            station: location.type === "station" ? location.station : null,
          },
          { signal }
        );
        setData(payload);
        return payload;
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to fetch prediction.");
        }
        return null;
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [location]
  );

  useEffect(() => {
    const controller = new AbortController();
    run({ signal: controller.signal });
    return () => controller.abort();
  }, [run]);

  return { data, loading, error, refresh: run };
}
