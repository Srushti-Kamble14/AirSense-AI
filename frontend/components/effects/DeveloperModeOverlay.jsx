"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Terminal } from "lucide-react";

const STATS = [
  { label: "Framework", value: "Next.js 15 (App Router)" },
  { label: "Renderer", value: "React 18 + Framer Motion" },
  { label: "Data Layer", value: "Mock (no network calls)" },
  { label: "Build", value: "Hackathon Edition" },
];

/**
 * Shown when developerMode is toggled via triple-clicking the logo.
 */
export function DeveloperModeOverlay({ active }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed left-1/2 top-20 z-50 w-[min(90vw,360px)] -translate-x-1/2 rounded-md border border-aurora-violet/40 bg-void-900/95 p-4 font-mono text-xs shadow-[0_0_40px_rgba(155,123,255,0.3)] backdrop-blur-xl"
        >
          <div className="mb-2 flex items-center gap-2 text-aurora-violet">
            <Terminal className="h-3.5 w-3.5" />
            <span className="uppercase tracking-widest">Developer Mode</span>
          </div>
          {STATS.map((s) => (
            <div key={s.label} className="flex justify-between py-0.5 text-foreground/80">
              <span className="text-muted-foreground">{s.label}</span>
              <span>{s.value}</span>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
