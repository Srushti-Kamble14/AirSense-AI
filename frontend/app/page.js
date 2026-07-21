"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, BrainCircuit, CircleDot, MapPin, Power, Radar, Satellite, ShieldCheck, Sparkles, Wind } from "lucide-react";

import { BootScreen } from "@/components/boot/BootScreen";
import { LiveSky } from "@/components/sky/LiveSky";
import { LivingEarth } from "@/components/sky/LivingEarth";
import { AirParticles } from "@/components/particles/AirParticles";
import { WeatherFX } from "@/components/weather/WeatherFX";
import { AQISummaryCard } from "@/components/dashboard/AQISummaryCard";
import { WeeklyForecast } from "@/components/dashboard/WeeklyForecast";
import { AirMapLoader } from "@/components/map/AirMapLoader";
import { AIPrediction } from "@/components/prediction/AIPrediction";
import { PredictionUpdater } from "@/components/prediction/PredictionUpdater";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { DeveloperModeOverlay } from "@/components/effects/DeveloperModeOverlay";
import { DroneFlyby } from "@/components/effects/DroneFlyby";
import { MatrixBackground } from "@/components/effects/MatrixBackground";
import { EndingSequence } from "@/components/effects/EndingSequence";
import { SuperSearch } from "@/components/search/SuperSearch";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/cards/GlassCard";

import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { useEasterEggs } from "@/hooks/useEasterEggs";
import { MOCK_CITIES, getCityById } from "@/data/mockCities";
import { getWeeklyForecast } from "@/data/mockAQI";
import { getAqiLevel } from "@/constants/aqi";
import { WEATHER_CONDITIONS } from "@/constants/weather";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8001";

const scanSteps = [
  "AI receiving atmospheric request",
  "Weather satellite lock acquired",
  "Radar scan crossing cloud layer",
  "Camera vectoring to target city",
  "Pollution model rebuilding",
  "Health advisory updating",
];

function cityLocation(city) {
  return {
    id: `city-${city.id}`,
    type: "city",
    label: city.name,
    city: city.name,
    latitude: city.lat,
    longitude: city.lng,
    aqi: city.aqi,
  };
}

function mapWeatherCondition(condition, fallback) {
  const normalized = String(condition ?? "").toLowerCase();
  if (normalized.includes("thunder")) return WEATHER_CONDITIONS.THUNDERSTORM;
  if (normalized.includes("rain") || normalized.includes("drizzle")) return WEATHER_CONDITIONS.RAIN;
  if (normalized.includes("snow")) return WEATHER_CONDITIONS.SNOW;
  if (normalized.includes("mist") || normalized.includes("fog") || normalized.includes("haze") || normalized.includes("smoke")) return WEATHER_CONDITIONS.FOG;
  if (normalized.includes("cloud")) return WEATHER_CONDITIONS.CLOUDY;
  if (normalized.includes("clear")) return WEATHER_CONDITIONS.SUNNY;
  return fallback ?? WEATHER_CONDITIONS.CLOUDY;
}

function windToKmh(value, fallback) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return fallback;
  return Math.round(Number(value) * 3.6);
}

function addRecentSearch(items, item) {
  const compact = {
    id: item.id,
    type: item.type,
    label: item.label,
    city: item.city,
    station: item.station,
    stationId: item.stationId,
    latitude: item.latitude,
    longitude: item.longitude,
    provider: item.provider,
    payload: item.payload,
  };
  return [compact, ...items.filter((existing) => existing.id !== compact.id)].slice(0, 5);
}

function useScanSequence(city) {
  const [scanCity, setScanCity] = useState(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!city) return undefined;
    setScanCity(city);
    setStep(0);
    const timers = scanSteps.map((_, index) => setTimeout(() => setStep(index), index * 430));
    const done = setTimeout(() => setScanCity(null), scanSteps.length * 430 + 900);
    return () => [...timers, done].forEach(clearTimeout);
  }, [city]);

  return { scanCity, step };
}

function AtmosphereCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    let last = 0;
    const onMove = (event) => {
      const point = { x: event.clientX, y: event.clientY };
      setPosition(point);
      const now = performance.now();
      if (now - last > 70) {
        last = now;
        setTrail((items) => [...items.slice(-8), { ...point, id: now }]);
      }
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] hidden lg:block">
      <motion.div
        className="absolute h-4 w-4 rounded-full bg-cyan-200/80 shadow-[0_0_24px_rgba(125,239,255,0.9)]"
        animate={{ x: position.x - 8, y: position.y - 8 }}
        transition={{ type: "spring", stiffness: 500, damping: 36, mass: 0.25 }}
      />
      {trail.map((dot) => (
        <motion.span
          key={dot.id}
          className="absolute h-1 w-1 rounded-full bg-cyan-100/70"
          style={{ left: dot.x, top: dot.y }}
          initial={{ opacity: 0.7, scale: 1 }}
          animate={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.8 }}
        />
      ))}
    </div>
  );
}

function AtmosphericIntelligenceStrip({ city, level }) {
  const items = [
    { label: "Wind", value: `${city.windSpeed ?? "--"} km/h`, icon: Wind },
    { label: "Humidity", value: `${city.humidity ?? "--"}%`, icon: Activity },
    { label: "Health", value: city.aqi > 200 ? "Mask advised" : "Routine safe", icon: ShieldCheck },
    { label: "Model", value: "AI live", icon: BrainCircuit },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.06 }}
            className="liquid-glass rounded-lg px-4 py-3"
          >
            <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
              <Icon className="h-3.5 w-3.5" style={{ color: level.color }} />
              {item.label}
            </div>
            <div className="font-display text-lg text-white">{item.value}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

function PlanetaryScan({ city, step, level }) {
  return (
    <AnimatePresence>
      {city && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center"
        >
          <motion.div
            className="absolute aspect-square w-[min(74vw,720px)] rounded-full"
            style={{ border: `1px solid ${level.color}55`, boxShadow: `0 0 80px ${level.glow}` }}
            initial={{ scale: 0.45, opacity: 0 }}
            animate={{ scale: [0.45, 1.08, 1.22], opacity: [0, 0.65, 0] }}
            transition={{ duration: 2.8, ease: "easeOut" }}
          />
          <motion.div
            className="liquid-glass w-[min(88vw,420px)] rounded-lg p-5 text-center"
            initial={{ y: 18, scale: 0.96 }}
            animate={{ y: 0, scale: 1 }}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <Satellite className="h-6 w-6" style={{ color: level.color }} />
            </div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">Planetary scan</p>
            <h3 className="mt-1 font-display text-2xl text-white">{city.stationName ?? city.name}</h3>
            <p className="mt-4 font-mono text-xs text-cyan-100/80">{scanSteps[step]}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Home() {
  const initialCity = getCityById("delhi");
  const [booted, setBooted] = useState(false);
  const [activeCity, setActiveCity] = useState(initialCity);
  const [activeLocation, setActiveLocation] = useState(() => cityLocation(initialCity));
  const [stationCache, setStationCache] = useState({});
  const [loadingStations, setLoadingStations] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predictionError, setPredictionError] = useState(null);
  const [toast, setToast] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);
  const [lastScannedCity, setLastScannedCity] = useState(null);
  const [ending, setEnding] = useState(false);
  const [earthFast, setEarthFast] = useState(false);

  const { timeOfDay } = useTimeOfDay();
  const {
    developerMode,
    droneVisible,
    matrixMode,
    assistantSass,
    registerLogoClick,
    registerLogoHoverStart,
    registerLogoHoverEnd,
    registerAssistantClick,
  } = useEasterEggs();

  const activeCityName = activeLocation.city;
  const cityStations = stationCache[activeCityName] ?? [];
  const stationsLoaded = Boolean(stationCache[activeCityName]);

  useEffect(() => {
    const city = activeCityName;
    if (!city || stationsLoaded) return undefined;

    const controller = new AbortController();
    setLoadingStations(true);

    fetch(`${API_BASE_URL}/locations?city=${encodeURIComponent(city)}`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json().catch(() => []);
        if (!response.ok) throw new Error(payload.detail || "Unable to fetch stations.");
        return payload;
      })
      .then((stations) => {
        setStationCache((cache) => ({ ...cache, [city]: stations }));
      })
      .catch((error) => {
        if (error.name !== "AbortError") setToast("Unable to fetch stations.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingStations(false);
      });

    return () => controller.abort();
  }, [activeCityName, stationsLoaded]);

  const displayedCity = useMemo(() => {
    const weather = prediction?.weather ?? {};
    const predictedAqi = prediction?.prediction?.predicted_aqi;
    return {
      ...activeCity,
      id: activeCity.id ?? activeLocation.city.toLowerCase(),
      name: activeLocation.city,
      stationName: activeLocation.type === "station" ? activeLocation.station : null,
      lat: activeLocation.latitude ?? activeCity.lat,
      lng: activeLocation.longitude ?? activeCity.lng,
      aqi: predictedAqi ?? activeLocation.aqi ?? activeCity.aqi,
      temp: weather.temperature !== undefined ? Math.round(weather.temperature) : activeCity.temp,
      humidity: weather.humidity ?? activeCity.humidity,
      windSpeed: windToKmh(weather.wind_speed, activeCity.windSpeed),
      windDeg: weather.wind_direction ?? activeCity.windDeg,
      weather: mapWeatherCondition(weather.condition, activeCity.weather),
    };
  }, [activeCity, activeLocation, prediction]);

  const level = getAqiLevel(displayedCity.aqi);
  const weeklyForecast = getWeeklyForecast(displayedCity.id, displayedCity.aqi);
  const showAurora = displayedCity.aqi < 60 && (timeOfDay === "night" || timeOfDay === "evening");
  const { scanCity, step } = useScanSequence(lastScannedCity);

  const environmentClass = useMemo(() => {
    if (displayedCity.aqi >= 301) return "env-severe";
    if (displayedCity.aqi >= 201) return "env-very-poor";
    if (displayedCity.aqi >= 151) return "env-poor";
    if (displayedCity.aqi >= 101) return "env-moderate";
    return "env-good";
  }, [displayedCity.aqi]);

  const onPredictionError = useCallback((message) => {
    const text = message === "Station not found" ? "Station not found" : "Unable to fetch prediction.";
    setPredictionError(text);
    setToast(text);
  }, []);

  const selectLocation = useCallback((item) => {
    if (item.type === "city") {
      const city = item.payload;
      setActiveCity(city);
      setActiveLocation(cityLocation(city));
      setLastScannedCity(city);
    } else {
      const city = MOCK_CITIES.find((candidate) => candidate.name.toLowerCase() === item.city.toLowerCase()) ?? activeCity;
      const stationLocation = {
        id: item.id,
        type: "station",
        label: item.label,
        city: item.city,
        station: item.station,
        stationId: item.stationId,
        latitude: item.latitude ?? city.lat,
        longitude: item.longitude ?? city.lng,
      };
      setActiveCity(city);
      setActiveLocation(stationLocation);
      setLastScannedCity({ ...city, name: item.city, stationName: item.station });
    }

    setPrediction(null);
    setPredictionError(null);
    setRecentSearches((items) => addRecentSearch(items, item));
  }, [activeCity]);

  const refreshPrediction = useCallback(() => {
    setActiveLocation((location) => ({ ...location, refreshKey: Date.now() }));
    setLastScannedCity(displayedCity);
  }, [displayedCity]);

  const activeMapLocation = useMemo(() => ({
    ...activeLocation,
    latitude: activeLocation.latitude ?? displayedCity.lat,
    longitude: activeLocation.longitude ?? displayedCity.lng,
    aqi: displayedCity.aqi,
  }), [activeLocation, displayedCity]);

  return (
    <main className={`atmospheric-os ${environmentClass} relative min-h-screen overflow-hidden text-white`}>
      <PredictionUpdater
        apiBaseUrl={API_BASE_URL}
        location={activeLocation}
        onLoading={setPredictionLoading}
        onPrediction={setPrediction}
        onError={onPredictionError}
      />

      {!booted && <BootScreen onComplete={() => setBooted(true)} />}

      {booted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.1 }}>
          <LiveSky timeOfDay={timeOfDay} showAurora={showAurora} className="fixed inset-0 z-0" />
          <LivingEarth
            fast={earthFast || Boolean(scanCity)}
            aqi={displayedCity.aqi}
            weather={displayedCity.weather}
            timeOfDay={timeOfDay}
            onDoubleClick={() => {
              setEarthFast(true);
              setTimeout(() => setEarthFast(false), 3800);
            }}
            className="fixed inset-0 z-[1]"
          />
          <div className="fixed inset-0 z-[2] bg-[radial-gradient(circle_at_36%_46%,transparent_0%,rgba(2,5,12,0.2)_42%,rgba(0,0,0,0.78)_100%)]" />
          <div className="fixed inset-0 z-[2] grid-mask opacity-60" />
          <AirParticles
            aqi={displayedCity.aqi}
            windDeg={displayedCity.windDeg}
            windSpeed={displayedCity.windSpeed}
            humidity={displayedCity.humidity}
            isRaining={displayedCity.weather === "rain" || displayedCity.weather === "thunderstorm"}
            className="fixed inset-0 z-[3]"
          />
          <WeatherFX condition={displayedCity.weather} className="fixed inset-0 z-[4]" />
          <div className="fixed inset-0 z-[5] noise-overlay" />

          <MatrixBackground active={matrixMode} />
          <DroneFlyby active={droneVisible} />
          <DeveloperModeOverlay active={developerMode} />
          <PlanetaryScan city={scanCity} step={step} level={level} />
          <AtmosphereCursor />

          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                onAnimationComplete={() => setTimeout(() => setToast(null), 2600)}
                className="fixed right-4 top-4 z-[80] rounded-md border border-red-400/30 bg-red-500/15 px-4 py-3 text-sm text-red-50 shadow-xl backdrop-blur-xl"
              >
                {toast}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10 min-h-screen px-4 py-5 sm:px-6 lg:px-8">
            <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
              <motion.button
                onClick={registerLogoClick}
                onMouseEnter={registerLogoHoverStart}
                onMouseLeave={registerLogoHoverEnd}
                className="group flex items-center gap-3"
                whileTap={{ scale: 0.96 }}
              >
                <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 shadow-[0_0_26px_rgba(118,238,255,0.35)]">
                  <CircleDot className="h-5 w-5 text-cyan-100" />
                  <span className="absolute inset-[-6px] rounded-full border border-white/15 opacity-60 transition-transform group-hover:scale-110" />
                </span>
                <span className="text-left">
                  <span className="block font-display text-lg font-semibold tracking-wide">AirSenseAI</span>
                  <span className="block text-[10px] uppercase tracking-[0.3em] text-white/45">Atmospheric intelligence</span>
                </span>
              </motion.button>

              <SuperSearch
                cities={MOCK_CITIES}
                stations={cityStations}
                loadingStations={loadingStations}
                recentSearches={recentSearches}
                onSelectLocation={selectLocation}
                className="order-3 w-full md:order-2 md:w-[380px]"
              />

              <div className="order-2 flex items-center gap-2 md:order-3">
                <Button variant="outline" size="sm" onClick={refreshPrediction} disabled={predictionLoading} className="gap-2">
                  <Radar className="h-3.5 w-3.5" />
                  Rescan
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setEnding(true)} aria-label="End session">
                  <Power className="h-4 w-4" />
                </Button>
              </div>
            </header>

            <section className="mx-auto grid max-w-7xl items-center gap-8 pb-10 pt-10 lg:min-h-[calc(100vh-96px)] lg:grid-cols-[minmax(0,1fr)_minmax(380px,520px)] lg:pt-8">
              <div className="max-w-3xl lg:pb-12">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-cyan-100/80 backdrop-blur-md"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Humanity's atmospheric operating system
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.08 }}
                  className="max-w-4xl font-display text-5xl font-semibold leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-7xl"
                >
                  Turning Invisible Air <span className="text-cyan-100">Into Visible Intelligence.</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.18 }}
                  className="mt-6 max-w-xl text-xl text-white/70"
                >
                  Monitor. Predict. Protect.
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.28 }}
                  className="mt-8 flex flex-wrap items-center gap-3"
                >
                  <Button size="lg" onClick={refreshPrediction} disabled={predictionLoading} className="magnetic-button gap-2">
                    <Satellite className="h-4 w-4" />
                    Explore Live Atmosphere
                  </Button>
                  <div className="text-sm text-white/50">
                    {displayedCity.stationName ? `${displayedCity.stationName}, ` : ""}{displayedCity.name} / AQI {Math.round(displayedCity.aqi)} / {level.label}
                  </div>
                </motion.div>

                <div className="mt-10 max-w-3xl">
                  <AtmosphericIntelligenceStrip city={displayedCity} level={level} />
                </div>
              </div>

              <div className="grid gap-4 lg:pb-8">
                <AQISummaryCard city={displayedCity} />
                <GlassCard weather={displayedCity.weather} interactive={false} className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">Planetary map</p>
                      <h2 className="font-display text-xl text-white">Satellite air layer</h2>
                    </div>
                    <MapPin className="h-5 w-5" style={{ color: level.color }} />
                  </div>
                  <AirMapLoader activeLocation={activeMapLocation} prediction={prediction} height={260} />
                </GlassCard>
              </div>
            </section>

            <section className="mx-auto grid max-w-7xl gap-5 pb-10 lg:grid-cols-[1fr_1fr]">
              <AIPrediction
                cityName={displayedCity.name}
                stationName={displayedCity.stationName}
                prediction={prediction}
                loading={predictionLoading}
                error={predictionError}
                onRefresh={refreshPrediction}
              />
              <WeeklyForecast forecast={weeklyForecast} />
            </section>
          </div>

          <AIAssistant sassy={assistantSass} onAssistantClick={registerAssistantClick} />
        </motion.div>
      )}

      <EndingSequence active={ending} onFinished={() => setEnding(false)} />
    </main>
  );
}
