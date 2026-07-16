"use client";

import { AnimatePresence, motion } from "framer-motion";
import { LivingEarth } from "@/components/sky/LivingEarth";

/**
 * Full-screen shutdown sequence. Not tied to actual page unload (browsers
 * block custom beforeunload UI) — trigger via an explicit "End Session"
 * action so the moment is always visible when it plays.
 */
export function EndingSequence({ active, onFinished }) {
  return (
    <AnimatePresence onExitComplete={onFinished}>
      {active && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: 3.4 }}
        >
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 0.15, opacity: [1, 1, 0] }}
            transition={{ duration: 2.6, ease: "easeInOut" }}
          >
            <LivingEarth size={220} />
          </motion.div>

          <motion.p
            className="absolute bottom-1/3 font-display text-sm tracking-[0.3em] text-aurora-cyan/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3, delay: 1, times: [0, 0.2, 0.7, 1] }}
          >
            GOODBYE · STAY SAFE · SEE YOU AGAIN
          </motion.p>

          <motion.div
            className="absolute bottom-8 right-8 h-2 w-2 rounded-full bg-aurora-cyan"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1, delay: 3 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
