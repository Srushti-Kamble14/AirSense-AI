"use client";

import { useEffect, useState } from "react";

function computeTimeOfDay(date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

/**
 * Returns the current time-of-day bucket ("morning" | "afternoon" | "evening" | "night")
 * and the raw hour (0-23), updating every minute.
 */
export function useTimeOfDay() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return {
    timeOfDay: computeTimeOfDay(now),
    hour: now.getHours(),
    minute: now.getMinutes(),
    date: now,
  };
}
