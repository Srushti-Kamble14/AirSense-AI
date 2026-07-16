"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { motion } from "framer-motion";
import { renderToStaticMarkup } from "react-dom/server";
import "leaflet/dist/leaflet.css";
import { getAqiLevel } from "@/constants/aqi";

function BreathingMarkerIcon({ color, severe }) {
  return (
    <div className="relative flex h-8 w-8 items-center justify-center">
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-40"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex h-4 w-4 rounded-full border-2 border-white/80"
        style={{ backgroundColor: color, boxShadow: `0 0 14px ${color}` }}
      />
      {severe && (
        <span
          className="absolute -top-3 h-3 w-3 rounded-full opacity-60 blur-[2px]"
          style={{ backgroundColor: "#c9c9c9" }}
        />
      )}
    </div>
  );
}

function makeDivIcon(color, severe) {
  const html = renderToStaticMarkup(<BreathingMarkerIcon color={color} severe={severe} />);
  return L.divIcon({
    html,
    className: "airsense-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function FlyToCity({ city }) {
  const map = useMap();

  useEffect(() => {
    if (!city) {
      return;
    }

    map.flyTo([city.lat, city.lng], 6, { duration: 1.4 });
  }, [city, map]);

  return null;
}

/**
 * @param {Array} cities - list of mock city objects (see data/mockCities.js)
 * @param {object} focusedCity - optional city to fly the camera to
 * @param {(city: object) => void} onSelectCity
 */
export function AirMap({ cities, focusedCity, onSelectCity, height = 420 }) {
  const icons = useMemo(() => {
    const map = new Map();
    cities.forEach((city) => {
      const level = getAqiLevel(city.aqi);
      map.set(city.id, makeDivIcon(level.color, city.aqi >= 201));
    });
    return map;
  }, [cities]);

  return (
    <div style={{ height }} className="overflow-hidden rounded-lg border border-white/10">
      <MapContainer
        center={[20, 30]}
        zoom={2}
        scrollWheelZoom
        style={{ height: "100%", width: "100%", background: "#0a0f1a" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors, &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {focusedCity && <FlyToCity city={focusedCity} />}
        {cities.map((city) => {
          const level = getAqiLevel(city.aqi);
          return (
            <Marker
              key={city.id}
              position={[city.lat, city.lng]}
              icon={icons.get(city.id)}
              eventHandlers={{ click: () => onSelectCity?.(city) }}
            >
              <Popup>
                <div className="font-sans text-sm">
                  <p className="font-semibold">{city.name}</p>
                  <p style={{ color: level.color }}>
                    AQI {city.aqi} · {level.label}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
