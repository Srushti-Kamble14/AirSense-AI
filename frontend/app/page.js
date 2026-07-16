"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Power } from "lucide-react";

import { BootScreen } from "@/components/boot/BootScreen";
import { LiveSky } from "@/components/sky/LiveSky";
import { LivingEarth } from "@/components/sky/LivingEarth";
import { AirParticles } from "@/components/particles/AirParticles";
import { WeatherFX } from "@/components/weather/WeatherFX";
import { Header } from "@/components/layout/Header";
import { AQISummaryCard } from "@/components/dashboard/AQISummaryCard";
import { CityGrid } from "@/components/dashboard/CityGrid";
import { WeeklyForecast } from "@/components/dashboard/WeeklyForecast";
import { AirMapLoader } from "@/components/map/AirMapLoader";
import { AIPrediction } from "@/components/prediction/AIPrediction";
import { AIAssistant } from "@/components/ai/AIAssistant";
import { DeveloperModeOverlay } from "@/components/effects/DeveloperModeOverlay";
import { DroneFlyby } from "@/components/effects/DroneFlyby";
import { MatrixBackground } from "@/components/effects/MatrixBackground";
import { EndingSequence } from "@/components/effects/EndingSequence";
import { Button } from "@/components/ui/button";

import { useTimeOfDay } from "@/hooks/useTimeOfDay";
import { useEasterEggs } from "@/hooks/useEasterEggs";
import { MOCK_CITIES, getCityById } from "@/data/mockCities";
import { getWeeklyForecast } from "@/data/mockAQI";

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [activeCity, setActiveCity] = useState(getCityById("delhi"));
  const [previewCity, setPreviewCity] = useState(null);
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

  const displayedCity = previewCity ?? activeCity;
  const weeklyForecast = getWeeklyForecast(displayedCity.id, displayedCity.aqi);
  const showAurora = displayedCity.aqi < 60 && (timeOfDay === "night" || timeOfDay === "evening");

  return (
    <main className="relative min-h-screen">
      {!booted && <BootScreen onComplete={() => setBooted(true)} />}

      {booted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          {/* Living background layers */}
          <LiveSky timeOfDay={timeOfDay} showAurora={showAurora} className="fixed inset-0 z-0" />
          <div className="fixed inset-0 z-0 grid-mask" />
          <AirParticles
            aqi={displayedCity.aqi}
            windDeg={displayedCity.windDeg}
            windSpeed={displayedCity.windSpeed}
            humidity={displayedCity.humidity}
            isRaining={displayedCity.weather === "rain" || displayedCity.weather === "thunderstorm"}
            className="fixed inset-0 z-[1]"
          />
          <WeatherFX condition={displayedCity.weather} className="fixed inset-0 z-[1]" />
          <div className="fixed inset-0 z-[1] noise-overlay" />

          <MatrixBackground active={matrixMode} />
          <DroneFlyby active={droneVisible} />
          <DeveloperModeOverlay active={developerMode} />

          <div className="relative z-10">
            <Header
              onSelectCity={(city) => {
                setActiveCity(city);
                setPreviewCity(null);
              }}
              onPreviewCity={setPreviewCity}
              onLogoClick={registerLogoClick}
              onLogoHoverStart={registerLogoHoverStart}
              onLogoHoverEnd={registerLogoHoverEnd}
              developerMode={developerMode}
            />

            <div className="container flex flex-col gap-6 py-8">
              <div className="flex flex-col items-start justify-between gap-6 lg:flex-row">
                <div className="w-full max-w-md">
                  <AQISummaryCard city={displayedCity} />
                </div>
                <div className="flex w-full justify-center lg:w-auto">
                  <LivingEarth
                    size={220}
                    fast={earthFast}
                    onDoubleClick={() => {
                      setEarthFast(true);
                      setTimeout(() => setEarthFast(false), 4000);
                    }}
                    className="drop-shadow-[0_0_40px_rgba(43,227,176,0.15)]"
                  />
                </div>
              </div>

              <section>
                <h3 className="mb-3 font-display text-xs uppercase tracking-widest text-muted-foreground">
                  Monitored Cities
                </h3>
                <CityGrid cities={MOCK_CITIES} activeCityId={activeCity.id} onSelect={setActiveCity} />
              </section>

              <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <AirMapLoader
                  cities={MOCK_CITIES}
                  focusedCity={activeCity}
                  onSelectCity={setActiveCity}
                />
                <div className="flex flex-col gap-6">
                  <AIPrediction cityName={displayedCity.name} baseAqi={displayedCity.aqi} />
                  <WeeklyForecast forecast={weeklyForecast} />
                </div>
              </section>

              <div className="flex justify-center pt-4">
                <Button variant="outline" size="sm" onClick={() => setEnding(true)} className="gap-2">
                  <Power className="h-3.5 w-3.5" />
                  End Session
                </Button>
              </div>
            </div>
          </div>

          <AIAssistant sassy={assistantSass} onAssistantClick={registerAssistantClick} />
        </motion.div>
      )}

      <EndingSequence active={ending} onFinished={() => setEnding(false)} />
    </main>
  );
}
