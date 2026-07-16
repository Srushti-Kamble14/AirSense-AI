"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SECRET_WORD = "airsense";

/**
 * Centralizes every hidden interaction so components stay declarative:
 * - triple-click logo -> developer mode
 * - hover logo 5s -> drone flyby
 * - typing "airsense" anywhere -> matrix background
 * - clicking AI assistant 5x -> sassy line
 */
export function useEasterEggs() {
  const [developerMode, setDeveloperMode] = useState(false);
  const [droneVisible, setDroneVisible] = useState(false);
  const [matrixMode, setMatrixMode] = useState(false);
  const [assistantSass, setAssistantSass] = useState(false);

  const logoClickCount = useRef(0);
  const logoClickTimer = useRef(null);
  const hoverTimer = useRef(null);
  const typedBuffer = useRef("");
  const assistantClickCount = useRef(0);
  const assistantClickTimer = useRef(null);

  const registerLogoClick = useCallback(() => {
    logoClickCount.current += 1;
    clearTimeout(logoClickTimer.current);
    logoClickTimer.current = setTimeout(() => {
      logoClickCount.current = 0;
    }, 700);
    if (logoClickCount.current >= 3) {
      setDeveloperMode((prev) => !prev);
      logoClickCount.current = 0;
    }
  }, []);

  const registerLogoHoverStart = useCallback(() => {
    hoverTimer.current = setTimeout(() => {
      setDroneVisible(true);
      setTimeout(() => setDroneVisible(false), 3200);
    }, 5000);
  }, []);

  const registerLogoHoverEnd = useCallback(() => {
    clearTimeout(hoverTimer.current);
  }, []);

  const registerAssistantClick = useCallback(() => {
    assistantClickCount.current += 1;
    clearTimeout(assistantClickTimer.current);
    assistantClickTimer.current = setTimeout(() => {
      assistantClickCount.current = 0;
    }, 2500);
    if (assistantClickCount.current >= 5) {
      setAssistantSass(true);
      assistantClickCount.current = 0;
      setTimeout(() => setAssistantSass(false), 4000);
    }
  }, []);

  useEffect(() => {
    function handleKeydown(e) {
      if (e.key.length !== 1) return;
      typedBuffer.current = (typedBuffer.current + e.key).slice(-SECRET_WORD.length).toLowerCase();
      if (typedBuffer.current === SECRET_WORD) {
        setMatrixMode((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, []);

  return {
    developerMode,
    droneVisible,
    matrixMode,
    assistantSass,
    registerLogoClick,
    registerLogoHoverStart,
    registerLogoHoverEnd,
    registerAssistantClick,
  };
}
