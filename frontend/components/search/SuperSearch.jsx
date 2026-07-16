"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, MapPin, Wind, Droplets } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchCities } from "@/data/mockCities";
import { getAqiLevel } from "@/constants/aqi";
import { cn } from "@/lib/utils";

/**
 * Instant-suggest search over the mock city dataset. Hovering a result
 * fires onPreview (for a mini-map/preview) without navigating away;
 * clicking fires onSelect.
 */
export function SuperSearch({ onSelect, onPreview, className }) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const results = useMemo(() => searchCities(query), [query]);

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search any city..."
          className="pl-9"
        />
      </div>

      <AnimatePresence>
        {focused && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute z-30 mt-2 w-full overflow-hidden rounded-md border border-white/10 bg-void-800/95 shadow-xl backdrop-blur-xl"
          >
            {results.map((city) => {
              const level = getAqiLevel(city.aqi);
              return (
                <motion.button
                  key={city.id}
                  onMouseEnter={() => onPreview?.(city)}
                  onClick={() => onSelect?.(city)}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-aurora-cyan" />
                    <div>
                      <p className="text-sm text-foreground">{city.name}</p>
                      <p className="text-[11px] text-muted-foreground">{city.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Droplets className="h-3 w-3" /> {city.humidity}%
                    </span>
                    <span className="flex items-center gap-1">
                      <Wind className="h-3 w-3" /> {city.windSpeed}km/h
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 font-mono"
                      style={{ color: level.color, backgroundColor: `${level.color}22` }}
                    >
                      {city.aqi}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
