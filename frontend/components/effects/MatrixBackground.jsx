"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GLYPHS = "01AQIΔΩ∴°CH2ONOX".split("");

/**
 * Canvas-based matrix rain, restyled with atmospheric glyphs (AQI, chemical
 * symbols, binary) instead of literal Matrix katakana. Toggled by typing
 * "airsense" anywhere on the page.
 */
export function MatrixBackground({ active }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops = new Array(columns).fill(0);

    function draw() {
      ctx.fillStyle = "rgba(5, 8, 16, 0.15)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#2be3b0";
      ctx.font = `${fontSize}px monospace`;
      drops.forEach((y, i) => {
        const text = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        ctx.fillText(text, i * fontSize, y * fontSize);
        if (y * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        } else {
          drops[i] += 1;
        }
      });
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();

    function handleResize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [active]);

  return (
    <AnimatePresence>
      {active && (
        <motion.canvas
          ref={canvasRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-20"
        />
      )}
    </AnimatePresence>
  );
}
