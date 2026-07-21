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
        <div className="min-w-52 font-sans text-sm text-slate-900">
          <p className="font-semibold">Searched location</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-700">{location.display_name || location.name}</p>
        </div>
      </Popup>
    </Marker>
  );
}

export function AQIMarker({ station, prediction }) {
  const predictedAqi = prediction?.prediction?.predicted_aqi ?? 0;
  const level = getAqiLevel(predictedAqi);
  const icon = useMemo(() => makeDivIcon("#22c55e"), []);

  if (!hasCoords(station)) return null;

  const weather = prediction?.weather ?? {};
  const category = prediction?.prediction?.category ?? level.label;
  const healthAdvisory = prediction?.health_advisory ?? "Prediction not loaded yet.";

  return (
    <Marker position={[station.latitude, station.longitude]} icon={icon}>
      <Popup>
        <div className="min-w-52 font-sans text-sm text-slate-900">
          <p className="font-semibold">Nearest station: {station.name}</p>
          <div className="mt-2 grid gap-1">
            <p>Distance: {station.distance_km ?? "--"} km</p>
            <p>Provider: {station.provider || "OpenAQ"}</p>
            <p>Predicted AQI: {formatNumber(predictedAqi)}</p>
            <p>Category: <span style={{ color: level.color }}>{category}</span></p>
            <p>Temperature: {formatNumber(weather.temperature, " C")}</p>
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
