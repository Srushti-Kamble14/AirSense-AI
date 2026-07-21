"use client";

import { useCallback, useEffect, useState } from "react";
import { getWeatherForecast } from "@/services/weather";

export function useWeatherForecast(location) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(
    async ({ signal } = {}) => {
      if (!location?.city) {
        setData([]);
        return [];
      }

      setLoading(true);
      setError(null);
      try {
        const payload = await getWeatherForecast({ city: location.city }, { signal });
        const list = Array.isArray(payload) ? payload : [];
        setData(list);
        return list;
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to fetch weather forecast.");
        }
        return [];
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
