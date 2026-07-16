"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * A tiny drone silhouette that flies across the screen once triggered.
 * Purely decorative, non-blocking.
 */
export function DroneFlyby({ active }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="pointer-events-none fixed top-24 z-50"
          initial={{ x: "-10vw", opacity: 0 }}
          animate={{ x: "110vw", opacity: [0, 1, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 3, ease: "easeInOut" }}
        >
          <svg width="46" height="24" viewBox="0 0 46 24" className="text-aurora-cyan/80">
            <g fill="currentColor">
              <rect x="18" y="9" width="10" height="6" rx="1.5" />
              <circle cx="8" cy="6" r="5" fillOpacity="0.6" className={cn("origin-center animate-spin-slower")} />
              <circle cx="38" cy="6" r="5" fillOpacity="0.6" />
              <circle cx="8" cy="18" r="5" fillOpacity="0.6" />
              <circle cx="38" cy="18" r="5" fillOpacity="0.6" />
              <line x1="18" y1="10" x2="8" y2="6" stroke="currentColor" strokeWidth="1" />
              <line x1="28" y1="10" x2="38" y2="6" stroke="currentColor" strokeWidth="1" />
              <line x1="18" y1="14" x2="8" y2="18" stroke="currentColor" strokeWidth="1" />
              <line x1="28" y1="14" x2="38" y2="18" stroke="currentColor" strokeWidth="1" />
            </g>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
