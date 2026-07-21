"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import "leaflet/dist/leaflet.css";
import { getAqiLevel } from "@/constants/aqi";

function formatNumber(value, suffix = "") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "--";
  return `${Math.round(Number(value))}${suffix}`;
}

function hasCoords(point) {
  return point?.latitude !== null && point?.latitude !== undefined && point?.longitude !== null && point?.longitude !== undefined;
}

export function AQIGlowLayer({ color }) {
  return <span className="absolute inline-flex h-12 w-12 animate-ping rounded-full opacity-35" style={{ backgroundColor: color, boxShadow: `0 0 28px ${color}` }} />;
}

function ActiveMarkerIcon({ color, ring = true }) {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      {ring && <AQIGlowLayer color={color} />}
      <span className="absolute h-8 w-8 rounded-full opacity-45 blur-md" style={{ backgroundColor: color }} />
      <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white/90" style={{ backgroundColor: color, boxShadow: `0 0 18px ${color}` }} />
    </div>
  );
}

function makeDivIcon(color, ring = true) {
  const html = renderToStaticMarkup(<ActiveMarkerIcon color={color} ring={ring} />);
  return L.divIcon({
    html,
    className: "airsense-marker",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -18],
  });
}

export function MapController({ searchedLocation, station }) {
  const map = useMap();

  useEffect(() => {
    if (!hasCoords(searchedLocation)) return;

    const userPoint = [searchedLocation.latitude, searchedLocation.longitude];
    if (hasCoords(station)) {
      const bounds = L.latLngBounds(userPoint, [station.latitude, station.longitude]).pad(0.32);
      map.flyToBounds(bounds, { animate: true, duration: 1.35, maxZoom: 15, easeLinearity: 0.2 });
      return;
    }

    map.flyTo(userPoint, 14, { animate: true, duration: 1.35, easeLinearity: 0.2 });
  }, [searchedLocation, station, map]);

  return null;
}

function SearchedMarker({ location }) {
  const icon = useMemo(() => makeDivIcon("#3b82f6"), []);
  if (!hasCoords(location)) return null;

  return (
    <Marker position={[location.latitude, location.longitude]} icon={icon}>
      <Popup>
        <div className="min-w-56 font-sans text-sm text-white">
          <p className="font-semibold text-base text-white border-b border-white/10 pb-1.5 mb-2">
            Location: <span className="text-cyan-200">{label}</span>
          </p>
          <div className="grid gap-1.5 text-xs text-white/90">
            <div className="flex justify-between">
              <span className="text-white/60">Predicted AQI:</span>
              <span className="font-semibold text-white">{formatNumber(predictedAqi)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Category:</span>
              <span className="font-bold" style={{ color: level.color }}>{category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Temperature:</span>
              <span className="text-white">{formatNumber(weather.temperature, "°C")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Humidity:</span>
              <span className="text-white">{formatNumber(weather.humidity, "%")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Wind:</span>
              <span className="text-white">{formatNumber(weather.wind_speed, " km/h")}</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/10">
            <p className="font-semibold text-xs text-white/80">Health Advisory</p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/70">{healthAdvisory}</p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function ConnectionLine({ searchedLocation, station }) {
  if (!hasCoords(searchedLocation) || !hasCoords(station)) return null;
  return (
    <Polyline
      positions={[
        [searchedLocation.latitude, searchedLocation.longitude],
        [station.latitude, station.longitude],
      ]}
      pathOptions={{ color: "#7dd3fc", weight: 2, opacity: 0.72, dashArray: "8 12", lineCap: "round" }}
      className="airsense-station-link"
    />
  );
}

export function AirMap({ activeLocation, prediction, height = 420 }) {
  const searchedLocation = prediction?.searched_location ?? activeLocation;
  const station = prediction?.nearest_station;
  const initialCenter = hasCoords(searchedLocation) ? [searchedLocation.latitude, searchedLocation.longitude] : [28.6139, 77.209];

  return (
    <div style={{ height }} className="overflow-hidden rounded-lg border border-white/10">
      <MapContainer center={initialCenter} zoom={14} scrollWheelZoom style={{ height: "100%", width: "100%", background: "#0a0f1a" }}>
        <TileLayer attribution='&copy; OpenStreetMap contributors, &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <MapController searchedLocation={searchedLocation} station={station} />
        <ConnectionLine searchedLocation={searchedLocation} station={station} />
        <SearchedMarker location={searchedLocation} />
        <AQIMarker station={station} prediction={prediction} />
      </MapContainer>
    </div>
  );
}
