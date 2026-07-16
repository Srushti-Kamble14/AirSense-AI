"use client";

import { useEffect, useState } from "react";

/**
 * Types out `text` one character at a time.
 * @param {string} text
 * @param {number} speed - ms per character
 * @param {number} startDelay - ms before typing starts
 */
export function useTypewriter(text, speed = 28, startDelay = 0) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let cancelled = false;
    let charIndex = 0;

    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (cancelled) return;
        charIndex += 1;
        setDisplayed(text.slice(0, charIndex));
        if (charIndex >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);

      return () => clearInterval(interval);
    }, startDelay);

    return () => {
      cancelled = true;
      clearTimeout(startTimeout);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}
