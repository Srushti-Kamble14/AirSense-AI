// Weather condition identifiers shared across sky, glass, and particle systems.

export const WEATHER_CONDITIONS = {
  SUNNY: "sunny",
  CLOUDY: "cloudy",
  RAIN: "rain",
  FOG: "fog",
  THUNDERSTORM: "thunderstorm",
  SNOW: "snow",
  CLEAR_NIGHT: "clear_night",
};

export const WEATHER_META = {
  [WEATHER_CONDITIONS.SUNNY]: { label: "Sunny", tint: "from-amber-400/20 via-sky-300/10 to-transparent" },
  [WEATHER_CONDITIONS.CLOUDY]: { label: "Cloudy", tint: "from-slate-400/15 via-slate-500/10 to-transparent" },
  [WEATHER_CONDITIONS.RAIN]: { label: "Rain", tint: "from-blue-500/20 via-slate-600/15 to-transparent" },
  [WEATHER_CONDITIONS.FOG]: { label: "Fog", tint: "from-slate-300/25 via-slate-400/15 to-transparent" },
  [WEATHER_CONDITIONS.THUNDERSTORM]: { label: "Thunderstorm", tint: "from-indigo-600/25 via-slate-800/20 to-transparent" },
  [WEATHER_CONDITIONS.SNOW]: { label: "Snow", tint: "from-cyan-100/20 via-slate-200/10 to-transparent" },
  [WEATHER_CONDITIONS.CLEAR_NIGHT]: { label: "Clear Night", tint: "from-indigo-900/30 via-violet-900/15 to-transparent" },
};
