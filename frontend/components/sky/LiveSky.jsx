"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * A reusable, time-of-day-aware animated sky. Purely decorative background
 * layer — pointer-events are disabled so it never blocks interaction.
 *
 * @param {"morning"|"afternoon"|"evening"|"night"} timeOfDay
 * @param {boolean} showAurora - rare northern-lights animation
 * @param {number} starCount
 */
export function LiveSky({ timeOfDay = "night", showAurora = false, starCount = 60, className }) {
  const isNight = timeOfDay === "night" || timeOfDay === "evening";
  const stars = useMemo(
    () =>
      Array.from({ length: starCount }).map((_, i) => ({
        id: i,
        top: Math.random() * 70,
        left: Math.random() * 100,
        size: Math.random() * 1.6 + 0.6,
        delay: Math.random() * 3,
      })),
    [starCount]
  );

  const clouds = useMemo(
    () =>
      Array.from({ length: 4 }).map((_, i) => ({
        id: i,
        top: 8 + i * 9,
        scale: 0.7 + Math.random() * 0.8,
        duration: 60 + i * 25,
        delay: -i * 15,
      })),
    []
  );

  const skyGradient = {
    morning: "from-[#1b2b45] via-[#2c3f63] to-[#0a0f1a]",
    afternoon: "from-[#132238] via-[#1c3350] to-[#0a0f1a]",
    evening: "from-[#241738] via-[#1a2540] to-[#0a0f1a]",
    night: "from-[#050810] via-[#0a0f1a] to-[#050810]",
  }[timeOfDay];

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <div className={cn("absolute inset-0 bg-gradient-to-b", skyGradient)} />

      {isNight &&
        stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{ top: `${star.top}%`, left: `${star.left}%`, width: star.size, height: star.size }}
            animate={{ opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 2.4 + star.delay, repeat: Infinity, delay: star.delay }}
          />
        ))}

      {/* Sun or moon */}
      <motion.div
        className={cn(
          "absolute right-[12%] top-[10%] rounded-full",
          isNight ? "h-14 w-14 bg-slate-100/90 shadow-[0_0_50px_rgba(226,232,240,0.5)]" : "h-16 w-16 bg-amber-200 shadow-[0_0_70px_rgba(251,191,36,0.55)]"
        )}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Drifting clouds */}
      {clouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="absolute h-8 rounded-full bg-white/10 blur-xl"
          style={{ top: `${cloud.top}%`, width: 160 * cloud.scale }}
          initial={{ x: "-20%" }}
          animate={{ x: "120%" }}
          transition={{ duration: cloud.duration, repeat: Infinity, ease: "linear", delay: cloud.delay }}
        />
      ))}

      {/* Occasional shooting star */}
      <motion.div
        className="absolute h-px w-24 bg-gradient-to-r from-transparent via-white to-transparent"
        style={{ top: "18%", left: "70%", rotate: -25 }}
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: [0, 1, 0], x: -220 }}
        transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 9, ease: "easeIn" }}
      />

      {/* Bird silhouettes for daytime */}
      {!isNight && (
        <motion.svg
          viewBox="0 0 40 20"
          className="absolute top-[22%] h-4 w-8 text-white/25"
          initial={{ x: "-10%" }}
          animate={{ x: "120%" }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        >
          <path d="M0 10 Q10 0 20 10 Q30 0 40 10" stroke="currentColor" strokeWidth="2" fill="none" />
        </motion.svg>
      )}

      {/* Rare aurora ribbon */}
      {showAurora && (
        <motion.div
          className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-aurora-teal/25 via-aurora-cyan/10 to-transparent blur-2xl"
          animate={{ opacity: [0.2, 0.6, 0.2], skewX: [-4, 4, -4] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
