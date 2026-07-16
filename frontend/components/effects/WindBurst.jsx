"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

/**
 * Wind particles exploding outward from center — the "success moment"
 * called for in place of confetti. Trigger by toggling `active` true briefly.
 */
export function WindBurst({ active }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => {
        const angle = (i / 24) * Math.PI * 2;
        return {
          id: i,
          dx: Math.cos(angle) * (120 + Math.random() * 80),
          dy: Math.sin(angle) * (120 + Math.random() * 80),
        };
      }),
    []
  );

  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute h-1.5 w-1.5 rounded-full bg-aurora-cyan"
              initial={{ x: 0, y: 0, opacity: 1 }}
              animate={{ x: p.dx, y: p.dy, opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
