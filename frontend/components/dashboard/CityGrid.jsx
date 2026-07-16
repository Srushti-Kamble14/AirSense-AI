"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/cards/GlassCard";
import { getAqiLevel } from "@/constants/aqi";
import { STAGGER } from "@/constants/animation";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: STAGGER.cards } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

/**
 * @param {Array} cities
 * @param {string} activeCityId
 * @param {(city: object) => void} onSelect
 */
export function CityGrid({ cities, activeCityId, onSelect }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
    >
      {cities.map((city) => {
        const level = getAqiLevel(city.aqi);
        const active = city.id === activeCityId;
        return (
          <motion.div key={city.id} variants={item}>
            <GlassCard
              weather={city.weather}
              onClick={() => onSelect(city)}
              className={`p-4 ${active ? "ring-1 ring-aurora-cyan/60" : ""}`}
            >
              <p className="truncate text-xs text-muted-foreground">{city.name}</p>
              <p className="mt-1 font-display text-xl font-semibold" style={{ color: level.color }}>
                {city.aqi}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground/70">{level.label}</p>
            </GlassCard>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
