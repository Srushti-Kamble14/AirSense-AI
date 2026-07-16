"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Wind } from "lucide-react";
import { useBootSequence } from "@/hooks/useBootSequence";
import { BOOT_SEQUENCE_STEPS, EASE } from "@/constants/animation";
import { cn } from "@/lib/utils";

/**
 * Full-screen "monitor powering on" experience shown before the dashboard.
 * Reusable: pass onComplete to hook into whatever happens next.
 */
export function BootScreen({ onComplete }) {
  const { phase, stepIndex, progress, skip } = useBootSequence({ onComplete });
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (phase === "complete") {
      const t = setTimeout(() => setExiting(true), 550);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
          exit={{
            scale: 18,
            opacity: 0,
            filter: "brightness(3)",
            transition: { duration: 0.9, ease: EASE.snappy },
          }}
        >
          {/* Tiny power LED, visible from the very first frame */}
          <motion.div
            className="absolute bottom-8 right-8 h-2 w-2 rounded-full bg-aurora-cyan"
            initial={{ opacity: 0.15 }}
            animate={{ opacity: [0.15, 0.9, 0.15] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />

          <AnimatePresence mode="wait">
            {phase === "off" && (
              <motion.div key="off" className="h-1 w-1 rounded-full bg-aurora-cyan/60" exit={{ opacity: 0 }} />
            )}

            {phase === "powering" && (
              <motion.div
                key="powering"
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: EASE.smooth }}
              >
                <motion.div
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-aurora-cyan/50"
                  animate={{ boxShadow: ["0 0 0px rgba(77,216,230,0.2)", "0 0 40px rgba(77,216,230,0.6)", "0 0 0px rgba(77,216,230,0.2)"] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                >
                  <Wind className="h-7 w-7 text-aurora-cyan" />
                </motion.div>
                <motion.div
                  className="h-px w-40 bg-gradient-to-r from-transparent via-aurora-cyan to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.2, ease: EASE.smooth }}
                />
              </motion.div>
            )}

            {phase === "diagnostics" && (
              <motion.div
                key="diagnostics"
                className="w-[min(90vw,480px)] font-mono text-sm text-aurora-cyan/90"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-6 flex items-center gap-3">
                  <Wind className="h-5 w-5" />
                  <span className="font-display text-base tracking-[0.2em] text-foreground">AIRSENSE·AI</span>
                </div>
                <div className="space-y-2">
                  {BOOT_SEQUENCE_STEPS.map((step, i) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: i <= stepIndex ? 1 : 0.15, x: 0 }}
                      transition={{ duration: 0.35 }}
                      className="flex items-center justify-between"
                    >
                      <span>{step.label}</span>
                      {i < stepIndex && <span className="text-aurora-teal">✓ Connected</span>}
                      {i === stepIndex && step.isProgress && (
                        <span className="text-foreground/70">{progress}%</span>
                      )}
                      {i === stepIndex && !step.isProgress && i < BOOT_SEQUENCE_STEPS.length - 1 && (
                        <span className="text-aurora-teal">✓ Online</span>
                      )}
                    </motion.div>
                  ))}
                </div>
                {stepIndex >= BOOT_SEQUENCE_STEPS.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 font-display text-lg tracking-wide text-foreground text-glow"
                  >
                    Welcome to AirSenseAI
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={skip}
            className={cn(
              "absolute bottom-8 left-8 text-[11px] uppercase tracking-widest text-white/30 transition-colors hover:text-white/70"
            )}
          >
            Skip intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
