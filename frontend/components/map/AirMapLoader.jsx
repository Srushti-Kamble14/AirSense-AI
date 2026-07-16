"use client";

import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";

// Leaflet touches `window` at import time, so the map must never render on
// the server. This wrapper is the only place that should import AirMap.
const AirMap = dynamic(() => import("./AirMap").then((mod) => mod.AirMap), {
  ssr: false,
  loading: () => (
    <Card>
      <CardContent className="flex h-[420px] items-center justify-center p-0">
        <p className="font-mono text-xs text-muted-foreground">Initializing map layer...</p>
      </CardContent>
    </Card>
  ),
});

export function AirMapLoader(props) {
  return <AirMap {...props} />;
}
