// Deterministic mock generators (seeded by city id) so numbers stay stable
// between renders instead of re-randomizing on every mount.

function seededRandom(seed) {
  let value = 0;
  for (let i = 0; i < seed.length; i += 1) {
    value = (value * 31 + seed.charCodeAt(i)) % 100000;
  }
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

export function getPollutantBreakdown(cityId, baseAqi) {
  const rand = seededRandom(cityId + "pollutants");
  return [
    { key: "pm25", label: "PM2.5", unit: "µg/m³", value: Math.round(baseAqi * 0.42 + rand() * 20) },
    { key: "pm10", label: "PM10", unit: "µg/m³", value: Math.round(baseAqi * 0.6 + rand() * 25) },
    { key: "no2", label: "NO₂", unit: "ppb", value: Math.round(20 + rand() * 40) },
    { key: "so2", label: "SO₂", unit: "ppb", value: Math.round(5 + rand() * 15) },
    { key: "co", label: "CO", unit: "ppm", value: Number((0.4 + rand() * 1.6).toFixed(1)) },
    { key: "o3", label: "O₃", unit: "ppb", value: Math.round(15 + rand() * 35) },
  ];
}

export function getHourlyAqiSeries(cityId, baseAqi) {
  const rand = seededRandom(cityId + "hourly");
  const hours = [];
  for (let h = 0; h < 24; h += 1) {
    const swing = Math.sin((h / 24) * Math.PI * 2) * 25;
    const noise = (rand() - 0.5) * 18;
    const value = Math.max(8, Math.round(baseAqi + swing + noise));
    hours.push({
      hour: `${h.toString().padStart(2, "0")}:00`,
      aqi: value,
    });
  }
  return hours;
}

export function getWeeklyForecast(cityId, baseAqi) {
  const rand = seededRandom(cityId + "weekly");
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((day, i) => {
    const drift = Math.sin(i * 0.9) * 30;
    const noise = (rand() - 0.5) * 22;
    return {
      day,
      aqi: Math.max(10, Math.round(baseAqi + drift + noise)),
      predicted: i >= 4,
    };
  });
}

export function getPollutantRadarData(cityId, baseAqi) {
  const breakdown = getPollutantBreakdown(cityId, baseAqi);
  const maxByKey = { pm25: 150, pm10: 200, no2: 80, so2: 40, co: 3, o3: 70 };
  return breakdown.map((p) => ({
    metric: p.label,
    value: Math.min(100, Math.round((p.value / maxByKey[p.key]) * 100)),
  }));
}
