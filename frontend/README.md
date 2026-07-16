# AirSenseAI — Frontend

A cinematic, "digital twin of the atmosphere" dashboard UI. Frontend only —
no backend, no auth, no database. Every number on screen comes from
`data/*.js` mock generators so the UI is fully interactive out of the box.

## Stack

- Next.js 15 (App Router, JavaScript)
- Tailwind CSS + shadcn-style UI primitives (`components/ui`)
- Framer Motion for every animation
- React Leaflet for the world map
- Recharts for AQI / pollutant charts
- Lucide React for icons
- tsparticles for the wind/air particle layer

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The build fetches Inter / Space Grotesk /
JetBrains Mono from Google Fonts at build time, so an internet connection is
required for `npm run build` / `npm run dev` (same as any `next/font/google`
project).

## Folder structure

```
app/                     Next.js App Router entry (layout, page, globals.css)
components/
  ai/                    AI assistant panel
  boot/                  Cinematic boot/power-on sequence
  cards/                 Reusable glass card + hologram modal
  charts/                Recharts wrappers (AQI trend, pollutant bars)
  dashboard/             Page-level composed widgets (summary card, city grid, forecast)
  effects/               Easter eggs (developer mode, drone, matrix rain, ending sequence, wind burst)
  layout/                Header
  map/                   React-Leaflet map + SSR-safe dynamic loader
  particles/             tsparticles air-particle system
  prediction/            AI "thinking" forecast experience
  quotes/                Rotating quote strip
  search/                Instant-suggest city search
  sky/                   Live animated sky + stylized living Earth
  ui/                    shadcn-style primitives (button, card, input, dialog, tabs, tooltip, badge)
  weather/               Rain/snow/fog/thunderstorm overlay effects
constants/               Central tokens: animation timing, AQI bands, weather metadata
data/                    Mock datasets + deterministic generators (no network calls)
hooks/                   useTimeOfDay, useTypewriter, useBootSequence, useEasterEggs, useAqiPrediction
lib/                     `cn()` class-merge helper + small utils
```

## Notes for backend integration

Every mock data source lives under `data/`. To wire up a real backend, swap
the bodies of `data/mockCities.js` and `data/mockAQI.js` for real API calls
(or React Query/fetch hooks) — every component consumes plain JS objects
via props, so no component code needs to change.

## Easter eggs

- Triple-click the logo → developer mode panel
- Hover the logo for 5s → drone flies across the screen
- Type "airsense" anywhere → matrix-style atmospheric rain background
- Click the AI assistant 5x quickly → it gets sassy
- Double-click the Earth → (hook is wired via `onDoubleClick`, extend as desired)
