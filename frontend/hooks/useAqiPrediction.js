"use client";

import { useCallback, useRef, useState } from "react";
import { AI_PREDICTION_STEPS } from "@/data/quotes";

/**
 * Simulates an AI prediction run: steps through AI_PREDICTION_STEPS with
 * delays, then resolves a mock forecast number. No network calls.
 */
export function useAqiPrediction(baseAqi = 120) {
  const [running, setRunning] = useState(false);
  const [stepIndex, setStepIndex] = useState(-1);
  const [result, setResult] = useState(null);
  const [justFinished, setJustFinished] = useState(false);
  const timeouts = useRef([]);

  const run = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
    setResult(null);
    setJustFinished(false);
    setRunning(true);
    setStepIndex(-1);

    let cumulative = 0;
    AI_PREDICTION_STEPS.forEach((_, i) => {
      cumulative += 550;
      const t = setTimeout(() => setStepIndex(i), cumulative);
      timeouts.current.push(t);
    });

    const finish = setTimeout(() => {
      const variance = Math.round((Math.random() - 0.5) * 40);
      setResult({
        predictedAqi: Math.max(5, baseAqi + variance),
        confidence: Math.round(78 + Math.random() * 18),
        trend: variance >= 0 ? "up" : "down",
      });
      setRunning(false);
      setJustFinished(true);
      setTimeout(() => setJustFinished(false), 1000);
    }, cumulative + 500);
    timeouts.current.push(finish);
  }, [baseAqi]);

  return {
    running,
    currentStepLabel: AI_PREDICTION_STEPS[stepIndex] ?? null,
    stepIndex,
    totalSteps: AI_PREDICTION_STEPS.length,
    result,
    justFinished,
    run,
  };
}
