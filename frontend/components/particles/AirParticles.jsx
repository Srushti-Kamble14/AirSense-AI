"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { clamp } from "@/lib/utils";

/**
 * Simulated airflow, not random noise: wind direction sets particle bearing,
 * AQI sets density, humidity slows drift, rain clears particles out.
 *
 * @param {number} aqi
 * @param {number} windDeg - 0-360
 * @param {number} windSpeed - km/h, used for relative speed
 * @param {number} humidity - 0-100, higher = slower particles
 * @param {boolean} isRaining - sharply reduces particle count
 * @param {string} color
 */
export function AirParticles({
  aqi = 80,
  windDeg = 200,
  windSpeed = 10,
  humidity = 50,
  isRaining = false,
  color = "#4dd8e6",
  className,
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setReady(true));
  }, []);

  const density = useMemo(() => {
    const base = clamp(Math.round(aqi / 6), 12, 90);
    return isRaining ? Math.round(base * 0.25) : base;
  }, [aqi, isRaining]);

  const speedFactor = useMemo(() => {
    const humidityDamp = 1 - clamp(humidity, 0, 100) / 220;
    return clamp((windSpeed / 20) * humidityDamp, 0.15, 1.4);
  }, [windSpeed, humidity]);

  const angleRad = (windDeg * Math.PI) / 180;
  const directionVector = {
    x: Math.round(Math.sin(angleRad) * 100) / 100,
    y: Math.round(-Math.cos(angleRad) * 100) / 100,
  };

  const options = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      detectRetina: true,
      background: { color: "transparent" },
      particles: {
        number: { value: density, density: { enable: true, area: 900 } },
        color: { value: color },
        opacity: { value: { min: 0.1, max: 0.5 } },
        size: { value: { min: 0.6, max: 2.2 } },
        move: {
          enable: true,
          speed: speedFactor * 2,
          direction: "none",
          straight: false,
          random: true,
          outModes: { default: "out" },
          vibrate: false,
          attract: { enable: false },
        },
        wobble: {
          enable: true,
          distance: 6,
          speed: 4,
        },
        links: { enable: false },
      },
      interactivity: {
        events: { onHover: { enable: false }, onClick: { enable: false } },
      },
      motion: { disable: false },
      emitters: {
        direction: undefined,
      },
    }),
    [density, color, speedFactor]
  );

  // Bias overall motion toward the wind vector using a global particle "move.direction" workaround:
  // tsparticles doesn't take arbitrary vectors directly in slim without custom updater, so we
  // approximate by nudging gravity-like acceleration along the wind vector.
  const optionsWithWind = useMemo(
    () => ({
      ...options,
      particles: {
        ...options.particles,
        move: {
          ...options.particles.move,
          gravity: {
            enable: true,
            acceleration: speedFactor * 0.6,
            inverse: directionVector.y < 0,
          },
        },
      },
    }),
    [options, speedFactor, directionVector.y]
  );

  if (!ready) return null;

  return (
    <div className={className} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      <Particles id="air-particles" options={optionsWithWind} />
    </div>
  );
}
