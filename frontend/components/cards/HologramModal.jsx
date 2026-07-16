"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { EASE } from "@/constants/animation";

/**
 * Wraps any content so opening it feels like projecting a hologram:
 * background blurs, content floats up with a scan-line sweep.
 *
 * @param {boolean} open
 * @param {(open: boolean) => void} onOpenChange
 * @param {string} title
 * @param {string} description
 */
export function HologramModal({ open, onOpenChange, title, description, children }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogContent className="border-aurora-cyan/40">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE.smooth }}
            >
              {/* Scan-line sweep for the hologram effect */}
              <motion.div
                className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-aurora-cyan/25 to-transparent"
                initial={{ y: "-100%" }}
                animate={{ y: "500%" }}
                transition={{ duration: 1.4, ease: "easeOut" }}
              />
              <DialogHeader>
                <DialogTitle className="text-glow text-aurora-cyan">{title}</DialogTitle>
                {description && <DialogDescription>{description}</DialogDescription>}
              </DialogHeader>
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {children}
              </motion.div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
