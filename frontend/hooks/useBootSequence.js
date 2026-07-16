"use client";

import { useEffect, useRef, useState } from "react";
import { BOOT_SEQUENCE_STEPS } from "@/constants/animation";

/**
 * Drives the cinematic boot sequence: powers on, steps through diagnostics,
 * then signals completion so the parent can transition into the dashboard.
 * Runs once per mount; call `skip()` to fast-forward (e.g. on repeat visits).
 */
export function useBootSequence({ onComplete } = {}) {
  const [phase, setPhase] = useState("off"); // off -> powering -> diagnostics -> complete
  const [stepIndex, setStepIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const skippedRef = useRef(false);

  useEffect(() => {
    let timeouts = [];

    const powerOnTimeout = setTimeout(() => {
      if (skippedRef.current) return;
      setPhase("powering");
    }, 900);
    timeouts.push(powerOnTimeout);

    const diagnosticsTimeout = setTimeout(() => {
      if (skippedRef.current) return;
      setPhase("diagnostics");
      let cumulative = 0;
      BOOT_SEQUENCE_STEPS.forEach((step, i) => {
        cumulative += step.delay;
        const t = setTimeout(() => {
          if (skippedRef.current) return;
          setStepIndex(i);
          if (step.isProgress) {
            let p = 0;
            const progInterval = setInterval(() => {
              p += Math.random() * 18 + 8;
              setProgress(Math.min(100, Math.round(p)));
              if (p >= 100) clearInterval(progInterval);
            }, 90);
          }
        }, cumulative);
        timeouts.push(t);
      });

      const finishTimeout = setTimeout(() => {
        if (skippedRef.current) return;
        setPhase("complete");
        onComplete?.();
      }, cumulative + 700);
      timeouts.push(finishTimeout);
    }, 1600);
    timeouts.push(diagnosticsTimeout);

    return () => timeouts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const skip = () => {
    skippedRef.current = true;
    setPhase("complete");
    setProgress(100);
    onComplete?.();
  };

  return {
    phase,
    currentStep: BOOT_SEQUENCE_STEPS[stepIndex] ?? null,
    stepIndex,
    progress,
    skip,
  };
}
