"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { BrainCircuit, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAqiPrediction } from "@/hooks/useAqiPrediction";
import { getAqiLevel } from "@/constants/aqi";
import { WindBurst } from "@/components/effects/WindBurst";

function NeuralNetwork({ active }) {
  const layers = [3, 5, 4, 1];
  const layerX = [40, 160, 280, 400];
  const nodes = useMemo(
    () =>
      layers.map((count, li) =>
        Array.from({ length: count }).map((_, ni) => ({
          x: layerX[li],
          y: 30 + ni * (200 / (count - 1 || 1)),
        }))
      ),
    []
  );

  return (
    <svg viewBox="0 0 440 260" className="h-40 w-full">
      {nodes.slice(0, -1).map((layer, li) =>
        layer.map((node, ni) =>
          nodes[li + 1].map((nextNode, nj) => (
            <motion.line
              key={`${li}-${ni}-${nj}`}
              x1={node.x}
              y1={node.y}
              x2={nextNode.x}
              y2={nextNode.y}
              stroke="rgba(77,216,230,0.25)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0.15 }}
              animate={
                active
                  ? { pathLength: [0, 1], opacity: [0.15, 0.6, 0.15] }
                  : { opacity: 0.15 }
              }
              transition={{ duration: 1.6, repeat: active ? Infinity : 0, delay: (ni + nj) * 0.05 }}
            />
          ))
        )
      )}
      {nodes.map((layer, li) =>
        layer.map((node, ni) => (
          <motion.circle
            key={`n-${li}-${ni}`}
            cx={node.x}
            cy={node.y}
            r={6}
            fill="#4dd8e6"
            animate={active ? { opacity: [0.4, 1, 0.4], r: [5, 7, 5] } : { opacity: 0.4 }}
            transition={{ duration: 1.4, repeat: active ? Infinity : 0, delay: li * 0.15 }}
          />
        ))
      )}
    </svg>
  );
}

/**
 * Runs a mock AI forecast pipeline for a given city and shows the "thinking"
 * neural-network animation with staged status text before revealing a result.
 */
export function AIPrediction({ cityName, baseAqi }) {
  const { running, currentStepLabel, stepIndex, totalSteps, result, justFinished, run } =
    useAqiPrediction(baseAqi);
  const level = result ? getAqiLevel(result.predictedAqi) : null;

  return (
    <Card className="border-aurora-cyan/20 relative">
      <WindBurst active={justFinished} />
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-aurora-cyan" />
            AI Forecast — {cityName}
          </CardTitle>
        </div>
        <Button size="sm" onClick={run} disabled={running}>
          {running ? "Thinking..." : "Run Prediction"}
        </Button>
      </CardHeader>
      <CardContent>
        <NeuralNetwork active={running} />

        <AnimatePresence mode="wait">
          {running && currentStepLabel && (
            <motion.p
              key={currentStepLabel}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-2 font-mono text-xs text-aurora-cyan/80"
            >
              {currentStepLabel}{" "}
              <span className="text-muted-foreground">
                ({stepIndex + 1}/{totalSteps})
              </span>
            </motion.p>
          )}

          {!running && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="mt-4 flex items-center justify-between rounded-md border border-white/10 bg-white/5 p-4"
            >
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Predicted AQI (next 6h)</p>
                <p className="font-display text-3xl font-semibold text-glow" style={{ color: level.color }}>
                  {result.predictedAqi}
                </p>
                <p className="text-xs text-muted-foreground">{level.label}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {result.trend === "up" ? (
                  <TrendingUp className="h-4 w-4 text-aqi-unhealthy" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-aqi-good" />
                )}
                <span className="text-muted-foreground">{result.confidence}% confidence</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
