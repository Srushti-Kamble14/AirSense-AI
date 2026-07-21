"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import "leaflet/dist/leaflet.css";
import { getAqiLevel } from "@/constants/aqi";

function formatNumber(value, suffix = "") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "--";
  return `${Math.round(Number(value))}${suffix}`;
}

export function AQIGlowLayer({ color }) {
  return (
    <span
      className="absolute inline-flex h-12 w-12 animate-ping rounded-full opacity-35"
      style={{ backgroundColor: color, boxShadow: `0 0 28px ${color}` }}
    />
  );
}

function ActiveMarkerIcon({ color }) {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <AQIGlowLayer color={color} />
      <span
        className="absolute h-8 w-8 rounded-full opacity-45 blur-md"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex h-4 w-4 rounded-full border-2 border-white/90"
        style={{ backgroundColor: color, boxShadow: `0 0 18px ${color}` }}
      />
    </div>
  );
}

function makeDivIcon(color) {
  const html = renderToStaticMarkup(<ActiveMarkerIcon color={color} />);
  return L.divIcon({
    html,
    className: "airsense-marker",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -18],
  });
}

export function MapController({ location }) {
  const map = useMap();

  useEffect(() => {
    if (!location?.latitude || !location?.longitude) return;

    map.flyTo([location.latitude, location.longitude], location.type === "station" ? 14 : 10, {
      animate: true,
      duration: 1.35,
      easeLinearity: 0.2,
    });
  }, [location, map]);

  return null;
}

export function AQIMarker({ location, prediction }) {
  const predictedAqi = prediction?.prediction?.predicted_aqi ?? location?.aqi ?? 0;
  const level = getAqiLevel(predictedAqi);
  const icon = useMemo(() => makeDivIcon(level.color), [level.color]);

  if (!location?.latitude || !location?.longitude) return null;

  const weather = prediction?.weather ?? {};
  const label = location.type === "station" ? location.station : location.city;
  const category = prediction?.prediction?.category ?? level.label;
  const healthAdvisory = prediction?.health_advisory ?? "Prediction not loaded yet.";

  return (
    <Marker position={[location.latitude, location.longitude]} icon={icon}>
      <Popup>
        <div className="min-w-52 font-sans text-sm text-slate-900">
          <p className="font-semibold">Location: {label}</p>
          <div className="mt-2 grid gap-1">
            <p>Predicted AQI: {formatNumber(predictedAqi)}</p>
            <p>Category: <span style={{ color: level.color }}>{category}</span></p>
            <p>Temperature: {formatNumber(weather.temperature, "C")}</p>
            <p>Humidity: {formatNumber(weather.humidity, "%")}</p>
            <p>Wind: {formatNumber(weather.wind_speed, " km/h")}</p>
          </div>
          <p className="mt-3 font-semibold">Health Advisory</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-700">{healthAdvisory}</p>
        </div>
      </Popup>
    </Marker>
  );
}

export function AirMap({ activeLocation, prediction, height = 420 }) {
  const initialCenter = activeLocation?.latitude && activeLocation?.longitude
    ? [activeLocation.latitude, activeLocation.longitude]
    : [28.6139, 77.209];

  return (
    <div style={{ height }} className="overflow-hidden rounded-lg border border-white/10">
      <MapContainer
        center={initialCenter}
        zoom={activeLocation?.type === "station" ? 14 : 10}
        scrollWheelZoom
        style={{ height: "100%", width: "100%", background: "#0a0f1a" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors, &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapController location={activeLocation} />
        <AQIMarker location={activeLocation} prediction={prediction} />
      </MapContainer>
    </div>
  );
}