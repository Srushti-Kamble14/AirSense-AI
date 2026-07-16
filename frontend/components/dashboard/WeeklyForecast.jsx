"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAqiLevel } from "@/constants/aqi";

/**
 * @param {{day: string, aqi: number, predicted: boolean}[]} forecast
 */
export function WeeklyForecast({ forecast }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>7-Day Outlook</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3 pt-2">
        {forecast.map((day) => {
          const level = getAqiLevel(day.aqi);
          return (
            <div
              key={day.day}
              className="flex w-20 flex-col items-center gap-2 rounded-md border border-white/10 bg-white/5 py-3"
            >
              <span className="text-xs text-muted-foreground">{day.day}</span>
              <span className="font-display text-lg font-semibold" style={{ color: level.color }}>
                {day.aqi}
              </span>
              {day.predicted && (
                <Badge variant="outline" className="text-[9px]">
                  AI
                </Badge>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
