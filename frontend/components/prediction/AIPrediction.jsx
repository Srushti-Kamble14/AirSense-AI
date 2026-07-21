"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { BrainCircuit, Loader2, RefreshCcw, RadioTower, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
              animate={active ? { pathLength: [0, 1], opacity: [0.15, 0.6, 0.15] } : { opacity: 0.15 }}
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

function confidenceText(confidence) {
  if (!confidence) return "----- Unknown";
  return `${confidence.stars} ${confidence.label}`;
}

export function AIPrediction({ cityName, stationName, prediction, loading, error, onRefresh }) {
  const predictedAqi = prediction?.prediction?.predicted_aqi;
  const category = prediction?.prediction?.category;
  const level = getAqiLevel(predictedAqi ?? 0);
  const searched = prediction?.searched_location;
  const nearest = prediction?.nearest_station;
  const title = searched?.name || cityName;
  const stationTitle = nearest?.name || stationName;

  return (
    <Card className="border-aurora-cyan/20 relative">
      <WindBurst active={Boolean(prediction) && !loading} />
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <CardTitle className="flex min-w-0 items-center gap-2">
          <BrainCircuit className="h-4 w-4 shrink-0 text-aurora-cyan" />
          <span className="truncate">AI Forecast - {title}</span>
        </CardTitle>
        <Button size="sm" onClick={onRefresh} disabled={loading} className="gap-2">
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
          {loading ? "Loading" : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent>
        <NeuralNetwork active={loading} />

        <AnimatePresence mode="wait">
          {loading && (
            <motion.p key="loading" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="mt-2 font-mono text-xs text-aurora-cyan/80">
              Geocoding place, matching nearest station, and blending live weather...
            </motion.p>
          )}

          {!loading && error && (
            <motion.div key="error" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="mt-4 rounded-md border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
              {error}
            </motion.div>
          )}

          {!loading && !error && prediction && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="mt-4 grid gap-4 rounded-md border border-white/10 bg-white/5 p-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Predicted AQI</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-glow" style={{ color: level.color }}>{Math.round(predictedAqi)}</p>
                  <p className="text-xs text-muted-foreground">{category}</p>
                </div>
                <p className="max-w-64 text-right text-xs leading-relaxed text-muted-foreground">{prediction.health_advisory}</p>
              </div>

              <div className="grid gap-3 rounded-md border border-white/10 bg-black/15 p-3 text-xs text-muted-foreground sm:grid-cols-2">
                <div className="flex gap-2">
                  <RadioTower className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <div>
                    <p className="font-medium text-white">{stationTitle || "Nearest station"}</p>
                    <p>{nearest?.provider || "OpenAQ"} / {nearest?.distance_km ?? "--"} km away</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-aurora-cyan" />
                  <div>
                    <p className="font-medium text-white">Confidence</p>
                    <p>{confidenceText(prediction.confidence)}</p>
                  </div>
                </div>
              </div>

              {prediction.notice && <p className="rounded-md border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">{prediction.notice}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
