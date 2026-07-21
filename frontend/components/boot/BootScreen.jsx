"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Satellite, Wind } from "lucide-react";
import { useBootSequence } from "@/hooks/useBootSequence";
import { BOOT_SEQUENCE_STEPS, EASE } from "@/constants/animation";
import { cn } from "@/lib/utils";

export function BootScreen({ onComplete }) {
  const { phase, stepIndex, progress, skip } = useBootSequence({ onComplete });
  const [exiting, setExiting] = useState(false);
  const [stars, setStars] = useState([]);

  // ✅ Client-side pe stars generate karo taaki Hydration Mismatch na aaye
  useEffect(() => {
    const generatedStars = Array.from({ length: 40 }).map((_, id) => ({
      id,
      left: `${(Math.random() * 100).toFixed(2)}%`,
      top: `${(Math.random() * 100).toFixed(2)}%`,
      delay: Math.random() * 2.8,
    }));
    setStars(generatedStars);
  }, []);

  useEffect(() => {
    if (phase === "complete") {
      const t = setTimeout(() => setExiting(true), 550);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [phase]);

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black"
          exit={{
            scale: 12,
            opacity: 0,
            filter: "brightness(3)",
            transition: { duration: 0.9, ease: EASE.snappy },
          }}
        >
          {/* Background Stars */}
          {stars.map((star) => (
            <motion.span
              key={star.id}
              className="absolute h-px w-px rounded-full bg-white/80"
              style={{ left: star.left, top: star.top }}
              animate={{ opacity: [0.15, 1, 0.15] }}
              transition={{
                duration: 2.4,
                repeat: Infinity,
                delay: star.delay,
              }}
            />
          ))}

          {/* Corner Status Indicator */}
          <motion.div
            className="absolute bottom-8 right-8 h-2 w-2 rounded-full bg-cyan-200"
            initial={{ opacity: 0.15 }}
            animate={{
              opacity: [0.15, 0.9, 0.15],
              boxShadow: [
                "0 0 4px rgba(125,239,255,0.2)",
                "0 0 24px rgba(125,239,255,0.8)",
                "0 0 4px rgba(125,239,255,0.2)",
              ],
            }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />

          <AnimatePresence mode="wait">
            {phase === "off" && (
              <motion.div
                key="off"
                className="h-1 w-1 rounded-full bg-cyan-100/60"
                exit={{ opacity: 0 }}
              />
            )}

            {phase === "powering" && (
              <motion.div
                key="powering"
                className="flex flex-col items-center gap-5"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: EASE.smooth }}
              >
                <motion.div
                  className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.04]"
                  animate={{
                    boxShadow: [
                      "0 0 0px rgba(125,239,255,0.2)",
                      "0 0 54px rgba(125,239,255,0.62)",
                      "0 0 0px rgba(125,239,255,0.2)",
                    ],
                  }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                >
                  <span className="absolute inset-[-12px] rounded-full border border-cyan-100/20" />
                  <Wind className="h-8 w-8 text-cyan-100" />
                </motion.div>
                <motion.div
                  className="h-px w-56 bg-gradient-to-r from-transparent via-cyan-100 to-transparent"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.2, ease: EASE.smooth }}
                />
              </motion.div>
            )}

            {phase === "diagnostics" && (
              <motion.div
                key="diagnostics"
                className="liquid-glass w-[min(90vw,520px)] rounded-lg p-7 font-mono text-sm text-cyan-100/90"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="mb-7 flex items-center gap-3">
                  <Satellite className="h-5 w-5" />
                  <span className="font-display text-base tracking-[0.24em] text-white">
                    AIRSENSEAI
                  </span>
                </div>
                <div className="space-y-3">
                  {BOOT_SEQUENCE_STEPS.map((step, i) => (
                    <motion.div
                      key={step.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: i <= stepIndex ? 1 : 0.16, x: 0 }}
                      transition={{ duration: 0.35 }}
                      className="flex items-center justify-between gap-4"
                    >
                      <span>{step.label}</span>
                      {i < stepIndex && (
                        <span className="text-emerald-200">Connected</span>
                      )}
                      {i === stepIndex && step.isProgress && (
                        <span className="text-white/70">{progress}%</span>
                      )}
                      {i === stepIndex &&
                        !step.isProgress &&
                        i < BOOT_SEQUENCE_STEPS.length - 1 && (
                          <span className="text-emerald-200">Online</span>
                        )}
                    </motion.div>
                  ))}
                </div>
                {stepIndex >= BOOT_SEQUENCE_STEPS.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-7 font-display text-xl tracking-wide text-white text-glow"
                  >
                    Mission Control Ready.
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={skip}
            className={cn(
              "absolute bottom-8 left-8 text-[11px] uppercase tracking-widest text-white/30 transition-colors hover:text-white/70",
            )}
          >
            Skip intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}