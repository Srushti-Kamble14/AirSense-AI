"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { DYNAMIC_QUOTES } from "@/data/quotes";
import { cn } from "@/lib/utils";

/**
 * Rotates through DYNAMIC_QUOTES on an interval, one at a time, fading between them.
 * @param {number} intervalMs
 */
export function QuoteRotator({ intervalMs = 5000, className }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % DYNAMIC_QUOTES.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return (
    <div className={cn("relative h-6 overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-x-0 font-display text-sm italic tracking-wide text-foreground/70"
        >
          {DYNAMIC_QUOTES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
