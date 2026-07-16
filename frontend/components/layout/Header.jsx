"use client";

import { motion } from "framer-motion";
import { Wind, Code2 } from "lucide-react";
import { SuperSearch } from "@/components/search/SuperSearch";
import { QuoteRotator } from "@/components/quotes/QuoteRotator";
import { cn } from "@/lib/utils";

/**
 * App header. Logo click/hover handlers are passed in from the page so all
 * easter-egg state lives in a single useEasterEggs() hook instance.
 */
export function Header({
  onSelectCity,
  onPreviewCity,
  onLogoClick,
  onLogoHoverStart,
  onLogoHoverEnd,
  developerMode,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-void-950/60 backdrop-blur-xl">
      <div className="container flex flex-wrap items-center justify-between gap-4 py-4">
        <motion.button
          onClick={onLogoClick}
          onMouseEnter={onLogoHoverStart}
          onMouseLeave={onLogoHoverEnd}
          className="flex items-center gap-2 select-none"
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-aurora-cyan to-aurora-violet"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Wind className="h-4 w-4 text-void-950" />
          </motion.div>
          <span className="font-display text-lg font-semibold tracking-wide text-glow text-foreground">
            AirSense<span className="text-aurora-cyan">AI</span>
          </span>
          {developerMode && (
            <span className="ml-2 flex items-center gap-1 rounded-full border border-aurora-violet/40 bg-aurora-violet/10 px-2 py-0.5 text-[10px] text-aurora-violet">
              <Code2 className="h-3 w-3" /> dev mode
            </span>
          )}
        </motion.button>

        <SuperSearch onSelect={onSelectCity} onPreview={onPreviewCity} className="order-3 w-full md:order-2 md:w-auto" />

        <div className="order-2 hidden md:order-3 md:block">
          <QuoteRotator />
        </div>
      </div>
    </header>
  );
}
