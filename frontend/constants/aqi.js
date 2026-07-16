// Single source of truth for AQI bands, colors and descriptions.

export const AQI_LEVELS = [
  { id: "good", label: "Good", min: 0, max: 50, color: "#2be3b0", glow: "rgba(43,227,176,0.55)" },
  { id: "moderate", label: "Moderate", min: 51, max: 100, color: "#e8d24c", glow: "rgba(232,210,76,0.55)" },
  { id: "sensitive", label: "Unhealthy for Sensitive Groups", min: 101, max: 150, color: "#f0a942", glow: "rgba(240,169,66,0.55)" },
  { id: "unhealthy", label: "Unhealthy", min: 151, max: 200, color: "#f2634e", glow: "rgba(242,99,78,0.55)" },
  { id: "severe", label: "Very Unhealthy", min: 201, max: 300, color: "#c23bd8", glow: "rgba(194,59,216,0.55)" },
  { id: "hazardous", label: "Hazardous", min: 301, max: 500, color: "#7c1f3a", glow: "rgba(124,31,58,0.6)" },
];

export function getAqiLevel(aqi) {
  return (
    AQI_LEVELS.find((level) => aqi >= level.min && aqi <= level.max) ??
    AQI_LEVELS[AQI_LEVELS.length - 1]
  );
}

export const POLLUTANTS = [
  { key: "pm25", label: "PM2.5", unit: "µg/m³" },
  { key: "pm10", label: "PM10", unit: "µg/m³" },
  { key: "no2", label: "NO₂", unit: "ppb" },
  { key: "so2", label: "SO₂", unit: "ppb" },
  { key: "co", label: "CO", unit: "ppm" },
  { key: "o3", label: "O₃", unit: "ppb" },
];
