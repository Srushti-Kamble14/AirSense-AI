"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { WEATHER_CONDITIONS } from "@/constants/weather";
import { cn } from "@/lib/utils";

/**
 * Renders the correct atmospheric effect layer for a given weather condition.
 * Fully decorative + non-blocking (pointer-events: none).
 */
export function WeatherFX({ condition = WEATHER_CONDITIONS.SUNNY, intensity = 1, className }) {
  const drops = useMemo(
    () =>
      Array.from({ length: Math.round(40 * intensity) }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 0.6 + Math.random() * 0.5,
      })),
    [intensity]
  );

  const flakes = useMemo(
    () =>
      Array.from({ length: Math.round(30 * intensity) }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 6 + Math.random() * 6,
        size: 2 + Math.random() * 3,
      })),
    [intensity]
  );

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      {condition === WEATHER_CONDITIONS.RAIN && (
        <>
          {drops.map((d) => (
            <motion.span
              key={d.id}
              className="absolute top-[-5%] block h-8 w-px bg-gradient-to-b from-transparent via-sky-300/60 to-transparent"
              style={{ left: `${d.left}%` }}
              animate={{ y: ["0%", "115vh"] }}
              transition={{ duration: d.duration, repeat: Infinity, delay: d.delay, ease: "linear" }}
            />
          ))}
        </>
      )}

      {condition === WEATHER_CONDITIONS.SNOW && (
        <>
          {flakes.map((f) => (
            <motion.span
              key={f.id}
              className="absolute top-[-5%] block rounded-full bg-white/80"
              style={{ left: `${f.left}%`, width: f.size, height: f.size }}
              animate={{ y: ["0%", "110vh"], x: [0, 20, -10, 0] }}
              transition={{ duration: f.duration, repeat: Infinity, delay: f.delay, ease: "linear" }}
            />
          ))}
        </>
      )}

      {condition === WEATHER_CONDITIONS.FOG && (
        <motion.div
          className="absolute inset-0 bg-slate-300/10 backdrop-blur-[2px]"
          animate={{ opacity: [0.3, 0.55, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {condition === WEATHER_CONDITIONS.THUNDERSTORM && (
        <>
          {drops.slice(0, 24).map((d) => (
            <motion.span
              key={d.id}
              className="absolute top-[-5%] block h-10 w-px bg-gradient-to-b from-transparent via-indigo-200/50 to-transparent"
              style={{ left: `${d.left}%` }}
              animate={{ y: ["0%", "115vh"] }}
              transition={{ duration: d.duration, repeat: Infinity, delay: d.delay, ease: "linear" }}
            />
          ))}
          <motion.div
            className="absolute inset-0 bg-white"
            animate={{ opacity: [0, 0, 0.5, 0, 0.2, 0] }}
            transition={{ duration: 6, repeat: Infinity, repeatDelay: 4, ease: "easeOut" }}
          />
        </>
      )}
    </div>
  );
}
