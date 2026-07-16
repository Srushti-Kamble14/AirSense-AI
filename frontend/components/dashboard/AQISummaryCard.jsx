"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gauge, Wind, Droplets, Thermometer } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { HologramModal } from "@/components/cards/HologramModal";
import { AQIChart } from "@/components/charts/AQIChart";
import { PollutantBars } from "@/components/charts/PollutantBars";
import { getAqiLevel } from "@/constants/aqi";
import { getHourlyAqiSeries, getPollutantBreakdown } from "@/data/mockAQI";
import { WEATHER_META } from "@/constants/weather";

/**
 * The primary "digital twin" reading for the selected city. Click to expand
 * into a hologram with the full hourly trend + pollutant breakdown.
 */
export function AQISummaryCard({ city }) {
  const [open, setOpen] = useState(false);
  const level = getAqiLevel(city.aqi);
  const hourly = getHourlyAqiSeries(city.id, city.aqi);
  const pollutants = getPollutantBreakdown(city.id, city.aqi);
  const weatherLabel = WEATHER_META[city.weather]?.label ?? city.weather;

  return (
    <>
      <GlassCard weather={city.weather} onClick={() => setOpen(true)} className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{city.country}</p>
            <h2 className="font-display text-2xl font-semibold text-foreground">{city.name}</h2>
          </div>
          <motion.div
            className="flex h-16 w-16 items-center justify-center rounded-full border-2"
            style={{ borderColor: level.color, boxShadow: `0 0 24px ${level.glow}` }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Gauge className="h-6 w-6" style={{ color: level.color }} />
          </motion.div>
        </div>

        <div className="mt-4 flex items-end gap-3">
          <span className="font-display text-5xl font-bold text-glow" style={{ color: level.color }}>
            {city.aqi}
          </span>
          <span className="mb-2 text-sm text-muted-foreground">{level.label}</span>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Thermometer className="h-3.5 w-3.5" /> {city.temp}°C
          </div>
          <div className="flex items-center gap-1.5">
            <Droplets className="h-3.5 w-3.5" /> {city.humidity}%
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="h-3.5 w-3.5" /> {city.windSpeed} km/h
          </div>
        </div>
        <p className="mt-3 text-[11px] uppercase tracking-wider text-muted-foreground/70">{weatherLabel} · tap to expand</p>
      </GlassCard>

      <HologramModal
        open={open}
        onOpenChange={setOpen}
        title={`${city.name} — Digital Twin`}
        description={`Live atmospheric reconstruction · ${level.label}`}
      >
        <div className="mt-4 grid gap-4">
          <AQIChart data={hourly} xKey="hour" title="24-Hour AQI Trend" color={level.color} />
          <PollutantBars data={pollutants} title="Pollutant Breakdown" />
        </div>
      </HologramModal>
    </>
  );
}
