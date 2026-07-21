"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RadioTower, Sparkles, X } from "lucide-react";
import { GlassCard } from "@/components/cards/GlassCard";
import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { useTypewriter } from "@/hooks/useTypewriter";
import { AI_GREETINGS, AI_EASTER_EGG_LINE } from "@/data/quotes";
import { cn } from "@/lib/utils";

function pickGreeting(timeOfDay) {
  const list = AI_GREETINGS[timeOfDay] ?? AI_GREETINGS.morning;
  return list[Math.floor(Math.random() * list.length)];
}

function predictionLine(prediction) {
  if (!prediction?.prediction) return null;

  const searched = prediction.searched_location?.name || prediction.searched_location?.display_name || "this location";
  const station = prediction.nearest_station?.name || prediction.station || "the nearest monitoring station";
  const distance = prediction.nearest_station?.distance_km;
  const confidence = prediction.confidence ? `${prediction.confidence.stars} ${prediction.confidence.label}` : "----- Unknown";
  const aqi = Math.round(prediction.prediction.predicted_aqi);

  return `${searched}: predicted AQI ${aqi} (${prediction.prediction.category}). I used ${station}${distance !== undefined && distance !== null ? `, ${distance} km away` : ""}, live weather at the searched coordinates, and current station pollutant readings. Confidence: ${confidence}. ${prediction.health_advisory}`;
}

export function AIAssistant({ sassy, prediction, onAssistantClick }) {
  const { timeOfDay } = useTimeOfDay();
  const [open, setOpen] = useState(true);
  const greeting = useMemo(() => pickGreeting(timeOfDay), [timeOfDay]);
  const activeLine = sassy ? AI_EASTER_EGG_LINE : predictionLine(prediction) || greeting;
  const { displayed } = useTypewriter(activeLine, 18, 180);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.9 }} transition={{ duration: 0.4 }}>
            <GlassCard weather="clear_night" interactive={false} className="w-80 p-4">
              <button onClick={() => setOpen(false)} className="absolute right-3 top-3 text-white/40 hover:text-white/80" aria-label="Dismiss assistant">
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="mb-2 flex items-center gap-2 text-aurora-cyan">
                {prediction?.nearest_station ? <RadioTower className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                <span className="font-display text-xs uppercase tracking-widest">AI Assistant</span>
              </div>
              <p className="min-h-[4.5rem] font-mono text-sm leading-relaxed text-foreground/90">
                {displayed}
                <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-aurora-cyan/70 align-middle" />
              </p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => {
          setOpen(true);
          onAssistantClick?.();
        }}
        whileTap={{ scale: 0.9 }}
        className={cn("flex h-14 w-14 items-center justify-center rounded-full", "bg-gradient-to-br from-aurora-cyan to-aurora-violet shadow-[0_0_30px_rgba(77,216,230,0.5)]")}
        animate={{ boxShadow: ["0 0 20px rgba(77,216,230,0.35)", "0 0 40px rgba(155,123,255,0.5)", "0 0 20px rgba(77,216,230,0.35)"] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <Sparkles className="h-6 w-6 text-void-950" />
      </motion.button>
    </div>
  );
}
