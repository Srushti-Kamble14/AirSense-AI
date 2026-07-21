"use client";

import { motion } from "framer-motion";
import { WEATHER_CONDITIONS } from "@/constants/weather";
import { cn } from "@/lib/utils";
import { DURATION, EASE } from "@/constants/animation";

const WEATHER_SURFACE = {
  [WEATHER_CONDITIONS.FOG]: "backdrop-blur-2xl bg-white/[0.075]",
  [WEATHER_CONDITIONS.RAIN]: "backdrop-blur-xl bg-sky-300/[0.055]",
  [WEATHER_CONDITIONS.SUNNY]: "backdrop-blur-md bg-amber-100/[0.08]",
  [WEATHER_CONDITIONS.CLOUDY]: "backdrop-blur-lg bg-white/[0.055]",
  [WEATHER_CONDITIONS.THUNDERSTORM]: "backdrop-blur-xl bg-indigo-300/[0.065]",
  [WEATHER_CONDITIONS.SNOW]: "backdrop-blur-lg bg-cyan-50/[0.075]",
  [WEATHER_CONDITIONS.CLEAR_NIGHT]: "backdrop-blur-lg bg-blue-950/[0.14]",
};

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
        "liquid-glass relative overflow-hidden rounded-lg shadow-[0_24px_80px_rgba(0,0,0,0.35)]",
        surfaceClass,
        interactive && "cursor-pointer transition-transform",
        className
      )}
      whileHover={interactive ? { y: -4, scale: 1.01, rotateX: 1.2, rotateY: -1.2 } : undefined}
      transition={{ duration: DURATION.fast, ease: EASE.smooth }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.24),transparent_24%),linear-gradient(135deg,rgba(255,255,255,0.14),transparent_42%,rgba(255,255,255,0.05))]" />
      <div className="pointer-events-none absolute -inset-x-20 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      <div className="relative z-10">{children}</div>
    </Component>
  );
}
