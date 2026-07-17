"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const EARTH_VIDEO = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260315_073750_51473149-4350-4920-ae24-c8214286f323.mp4";

function getAqiAtmosphere(aqi) {
  if (aqi >= 301) {
    return {
      tint: "rgba(118, 39, 171, 0.42)",
      glow: "rgba(255, 45, 85, 0.58)",
      haze: 0.56,
      warning: true,
    };
  }
  if (aqi >= 201) {
    return { tint: "rgba(226, 76, 42, 0.34)", glow: "rgba(255, 99, 64, 0.46)", haze: 0.44 };
  }
  if (aqi >= 151) {
    return { tint: "rgba(238, 134, 53, 0.26)", glow: "rgba(255, 156, 70, 0.36)", haze: 0.3 };
  }
  if (aqi >= 101) {
    return { tint: "rgba(245, 190, 93, 0.16)", glow: "rgba(255, 210, 120, 0.28)", haze: 0.18 };
  }
  return { tint: "rgba(91, 221, 255, 0.12)", glow: "rgba(67, 220, 255, 0.42)", haze: 0.08 };
}

export function LivingEarth({ fast = false, aqi = 60, weather, timeOfDay, className, onDoubleClick }) {
  const [stars, setStars] = useState([]);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 70, damping: 22 });
  const smoothY = useSpring(y, { stiffness: 70, damping: 22 });
  const videoX = useTransform(smoothX, [-0.5, 0.5], [18, -18]);
  const videoY = useTransform(smoothY, [-0.5, 0.5], [12, -12]);
  const atmosphere = useMemo(() => getAqiAtmosphere(aqi), [aqi]);
  const night = timeOfDay === "night";

  useEffect(() => {
    setStars(
      Array.from({ length: 18 }).map((_, index) => ({
        id: index,
        left: Math.random() * 100,
        top: Math.random() * 72,
        delay: Math.random() * 7,
        duration: 2 + Math.random() * 3,
      }))
    );
  }, []);

  useEffect(() => {
    const onMove = (event) => {
      x.set(event.clientX / window.innerWidth - 0.5);
      y.set(event.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y]);

  return (
    <div className={cn("pointer-events-auto overflow-hidden bg-black", className)} onDoubleClick={onDoubleClick}>
      <motion.div className="absolute inset-[-4%]" style={{ x: videoX, y: videoY }}>
        <motion.video
          className="h-full w-full object-cover opacity-90"
          src={EARTH_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          animate={{ scale: fast ? 1.08 : 1.03, filter: fast ? "saturate(1.22) contrast(1.08)" : "saturate(1.05) contrast(1.04)" }}
          transition={{ duration: 1.2 }}
        />
      </motion.div>

      <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 42% 46%, transparent 0 32%, ${atmosphere.tint} 54%, rgba(0,0,0,0.5) 100%)` }} />
      <motion.div
        className="absolute left-[8%] top-[6%] h-[80vh] w-[80vh] rounded-full blur-3xl"
        style={{ backgroundColor: atmosphere.glow }}
        animate={{ opacity: [0.26, 0.44, 0.26], scale: [0.98, 1.05, 0.98] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 opacity-35 mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(circle at 28% 35%, rgba(255,255,255,0.16), transparent 17%), radial-gradient(circle at 62% 58%, rgba(255,255,255,0.11), transparent 19%), linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.12), transparent 62%)",
        }}
        animate={{ x: fast ? [0, 40, 0] : [0, 14, 0], y: [0, -8, 0] }}
        transition={{ duration: fast ? 8 : 24, repeat: Infinity, ease: "linear" }}
      />
      <div
        className="absolute inset-0 backdrop-blur-[1px]"
        style={{ backgroundColor: `rgba(210, 223, 221, ${atmosphere.haze})`, mixBlendMode: "screen" }}
      />

      {night && (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(230,240,255,0.28),transparent_7%),radial-gradient(circle_at_22%_28%,rgba(255,255,255,0.22),transparent_1px),radial-gradient(circle_at_64%_12%,rgba(255,255,255,0.22),transparent_1px)]" />
          <motion.div
            className="absolute left-[12%] top-[14%] h-24 w-[54vw] rounded-full bg-gradient-to-r from-emerald-300/0 via-emerald-300/25 to-fuchsia-300/0 blur-2xl"
            animate={{ opacity: [0, 0.55, 0], x: [-80, 60, 130] }}
            transition={{ duration: 9, repeat: Infinity, repeatDelay: 8 }}
          />
        </>
      )}

      {stars.map((star) => (
        <motion.span
          key={star.id}
          className="absolute h-px w-16 rounded-full bg-gradient-to-r from-transparent via-white to-transparent"
          style={{ left: `${star.left}%`, top: `${star.top}%` }}
          initial={{ opacity: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 0.75, 0], x: [0, 260], y: [0, 90] }}
          transition={{ duration: star.duration, repeat: Infinity, repeatDelay: 9 + star.delay, delay: star.delay }}
        />
      ))}

      {atmosphere.warning && (
        <motion.div
          className="absolute left-[10%] top-[10%] h-[70vh] w-[70vh] rounded-full border border-red-300/35"
          animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.18, 0.55, 0.18] }}
          transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.22),transparent_35%,rgba(0,0,0,0.3)_100%)]" />
      <div className="absolute inset-0 shadow-[inset_0_0_180px_rgba(0,0,0,0.72)]" />
    </div>
  );
}
