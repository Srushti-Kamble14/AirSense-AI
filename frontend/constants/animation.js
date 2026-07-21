// Centralized animation timing so no component hardcodes durations/easings.

export const EASE = {
  smooth: [0.22, 1, 0.36, 1],
  snappy: [0.16, 1, 0.3, 1],
  soft: [0.4, 0, 0.2, 1],
};

export const DURATION = {
  instant: 0.15,
  fast: 0.3,
  base: 0.5,
  slow: 0.9,
  cinematic: 1.6,
};

export const BOOT_SEQUENCE_STEPS = [
  { id: "sensors", label: "Checking Atmospheric Sensors...", delay: 400 },
  { id: "satellites", label: "Synchronizing Weather Satellites...", delay: 550 },
  { id: "ai-core", label: "Loading AI Engine...", delay: 500 },
  { id: "pollution-network", label: "Connecting Pollution Network...", delay: 500 },
  { id: "env-models", label: "Building Planetary Weather Model...", delay: 600 },
  { id: "live-data", label: "Building Digital Twin...", delay: 900, isProgress: true },
  { id: "ready", label: "Mission Control Ready.", delay: 500 },
];

export const STAGGER = {
  cards: 0.08,
  list: 0.05,
};
