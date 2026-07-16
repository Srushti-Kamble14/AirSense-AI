"use client";

import { motion } from "framer-motion";
import { WEATHER_CONDITIONS } from "@/constants/weather";
import { cn } from "@/lib/utils";
import { DURATION, EASE } from "@/constants/animation";

const WEATHER_SURFACE = {
  [WEATHER_CONDITIONS.FOG]: "backdrop-blur-2xl bg-white/[0.07] border-white/[0.14]",
  [WEATHER_CONDITIONS.RAIN]: "backdrop-blur-xl bg-blue-400/[0.05] border-blue-200/[0.15]",
  [WEATHER_CONDITIONS.SUNNY]: "backdrop-blur-md bg-white/[0.09] border-amber-100/[0.18]",
  [WEATHER_CONDITIONS.CLOUDY]: "backdrop-blur-lg bg-white/[0.06] border-white/[0.1]",
  [WEATHER_CONDITIONS.THUNDERSTORM]: "backdrop-blur-xl bg-indigo-400/[0.06] border-indigo-200/[0.14]",
  [WEATHER_CONDITIONS.SNOW]: "backdrop-blur-lg bg-cyan-50/[0.08] border-cyan-100/[0.18]",
  [WEATHER_CONDITIONS.CLEAR_NIGHT]: "backdrop-blur-lg bg-blue-950/[0.15] border-blue-300/[0.12]",
};

/**
 * Glass surface that subtly changes texture based on the `weather` prop
 * (fog = frostier blur, rain = cool tint, sunny = brighter reflection, night = blue tint).
 * Any content can be passed as children — this is a pure presentational shell.
 */
export function GlassCard({
  weather = WEATHER_CONDITIONS.CLOUDY,
  interactive = true,
  onClick,
  className,
  children,
  as: Component = motion.div,
}) {
  const surfaceClass = WEATHER_SURFACE[weather] ?? WEATHER_SURFACE[WEATHER_CONDITIONS.CLOUDY];

  return (
    <Component
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-lg border shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
        surfaceClass,
        interactive && "cursor-pointer transition-transform",
        className
      )}
      whileHover={interactive ? { y: -4, scale: 1.01 } : undefined}
      transition={{ duration: DURATION.fast, ease: EASE.smooth }}
    >
      {/* Reflection sheen */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
