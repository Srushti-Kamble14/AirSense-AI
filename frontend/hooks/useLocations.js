"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getLocations } from "@/services/locations";

export function useLocations(city) {
  const [cache, setCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const normalizedCity = city?.trim() ?? "";
  const stations = useMemo(() => cache[normalizedCity] ?? [], [cache, normalizedCity]);
  const loaded = Boolean(normalizedCity && cache[normalizedCity]);

  const load = useCallback(
    async ({ force = false, signal } = {}) => {
      if (!normalizedCity || (!force && cache[normalizedCity])) {
        return cache[normalizedCity] ?? [];
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getLocations(normalizedCity, { signal });
        const list = Array.isArray(data) ? data : [];
        setCache((current) => ({ ...current, [normalizedCity]: list }));
        return list;
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to fetch stations.");
        }
        return [];
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [cache, normalizedCity]
  );

  useEffect(() => {
    if (!normalizedCity || loaded) return undefined;

    const controller = new AbortController();
    load({ signal: controller.signal });
    return () => controller.abort();
  }, [load, loaded, normalizedCity]);

  return { stations, loading, error, load };
}
