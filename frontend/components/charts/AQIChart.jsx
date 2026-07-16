"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-white/10 bg-void-800/95 px-3 py-2 text-xs backdrop-blur-md">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-mono text-aurora-cyan">AQI {payload[0].value}</p>
    </div>
  );
}

/**
 * Generic AQI area chart. Fully driven by props/mock data — no fetching.
 * @param {{hour?: string, day?: string, aqi: number}[]} data
 * @param {string} xKey - "hour" or "day"
 * @param {string} title
 * @param {string} color
 */
export function AQIChart({ data, xKey = "hour", title = "AQI Trend", color = "#4dd8e6" }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey={xKey} stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} width={32} />
            <Tooltip content={<ChartTooltip />} />
            <Area type="monotone" dataKey="aqi" stroke={color} strokeWidth={2} fill="url(#aqiFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
