"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { cn } from "@/lib/utils";

/**
 * A stylized CSS/SVG globe. Sunlight direction is derived from the real
 * current hour so the terminator genuinely tracks local time; the visible
 * spin itself runs on a slow decorative loop (a literal 24h rotation would
 * be visually imperceptible), giving the "living" feel the brief asks for
 * without faking a fixed-speed real-time rotation.
 *
 * @param {number} size - diameter in px
 * @param {boolean} fast - easter-egg: spin faster (double-click Earth)
 */
export function LivingEarth({ size = 260, fast = false, className, onDoubleClick }) {
  const { hour } = useTimeOfDay();
  const isNight = hour < 6 || hour >= 19;

  const cityLights = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        top: 20 + Math.random() * 60,
        left: 20 + Math.random() * 60,
        delay: Math.random() * 2,
      })),
    []
  );

  return (
    <div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      onDoubleClick={onDoubleClick}
    >
      {/* Atmosphere glow */}
      <motion.div
        className="absolute inset-[-14%] rounded-full bg-aurora-cyan/20 blur-2xl"
        animate={{ opacity: [0.35, 0.6, 0.35] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Cloud layer — rotates independently, opposite direction */}
      <motion.div
        className="absolute inset-[6%] rounded-full opacity-40 mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 18%), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.4) 0%, transparent 15%), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.35) 0%, transparent 20%)",
        }}
        animate={{ rotate: -360 }}
        transition={{ duration: fast ? 20 : 90, repeat: Infinity, ease: "linear" }}
      />

      {/* Planet body */}
      <motion.div
        className="relative overflow-hidden rounded-full shadow-[0_0_60px_rgba(43,227,176,0.25)]"
        style={{
          width: "100%",
          height: "100%",
          backgroundImage:
            "radial-gradient(circle at 35% 35%, #1c4d63 0%, #0f2f42 35%, #081c2b 65%, #04101a 100%)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: fast ? 14 : 70, repeat: Infinity, ease: "linear" }}
      >
        {/* Landmass blobs */}
        <div
          className="absolute inset-0 opacity-70 mix-blend-color-dodge"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 40%, rgba(43,227,176,0.5) 0%, transparent 12%), radial-gradient(circle at 60% 25%, rgba(43,227,176,0.4) 0%, transparent 14%), radial-gradient(circle at 70% 65%, rgba(43,227,176,0.45) 0%, transparent 16%), radial-gradient(circle at 40% 75%, rgba(43,227,176,0.35) 0%, transparent 10%)",
          }}
        />

        {/* City lights, visible mainly on the night side */}
        {isNight &&
          cityLights.map((light) => (
            <motion.div
              key={light.id}
              className="absolute h-[3px] w-[3px] rounded-full bg-amber-200"
              style={{ top: `${light.top}%`, left: `${light.left}%` }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 2 + light.delay, repeat: Infinity, delay: light.delay }}
            />
          ))}
      </motion.div>

      {/* Day/night terminator sweep, angled by current hour */}
      <div
        className="absolute inset-0 rounded-full mix-blend-multiply"
        style={{
          background: `linear-gradient(${90 + hour * 15}deg, transparent 45%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%)`,
        }}
      />

      {/* Orbit ring */}
      <motion.div
        className="absolute inset-[-22%] rounded-full border border-aurora-cyan/15"
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
