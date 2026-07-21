"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function ChartTooltip({ active, payload, label, valueLabel }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-white/10 bg-void-800/95 px-3 py-2 text-xs backdrop-blur-md">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-mono text-aurora-cyan">
        {valueLabel} {payload[0].value}
      </p>
    </div>
  );
}

export function AQIChart({
  data = [],
  xKey = "time",
  yKey = "value",
  title = "Trend",
  color = "#4dd8e6",
  valueLabel = "Value",
  emptyMessage = "No backend trend data available yet.",
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-64 pt-2">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-md border border-white/10 bg-white/5 px-4 text-center text-xs text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey={xKey} stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} width={32} />
              <Tooltip content={<ChartTooltip valueLabel={valueLabel} />} />
              <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} fill="url(#trendFill)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}