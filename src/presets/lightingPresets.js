/**
 * Solenne Studio Lighting & Camera Presets
 * Designed specifically for high-end fashion visualization and beauty portraiture.
 */

export const LIGHTING_PRESETS = {
  softStudio: {
    id: "softStudio",
    label: "Soft Studio Octabox",
    description: "Flattering, wrap-around high-key beauty lighting with soft shadows.",
    keyLight: { color: "#fff5eb", intensity: 2.2, position: [-2.2, 3.4, 3.0] },
    fillLight: { color: "#c8d8ea", intensity: 0.75, position: [3.0, 2.0, 1.4] },
    rimLight: { color: "#fff0dd", intensity: 1.1, position: [0.2, 2.8, -3.2] },
    spotLight: { color: "#ffffff", intensity: 0.5, position: [0, 4.0, 2.0] },
    ambient: { color: "#f5ece2", ground: "#3c322a", intensity: 0.6 },
    envIntensity: 0.4
  },

  beauty: {
    id: "beauty",
    label: "Beauty Key & Rim",
    description: "Camera-left octabox with hair rim light for maximum facial detail.",
    keyLight: { color: "#fff8f0", intensity: 2.6, position: [-1.8, 3.0, 2.6] },
    fillLight: { color: "#d8e4f2", intensity: 0.5, position: [2.6, 1.8, 1.8] },
    rimLight: { color: "#ffe6cc", intensity: 1.4, position: [0.4, 3.2, -2.8] },
    spotLight: { color: "#ffffff", intensity: 0.7, position: [0, 4.5, 1.5] },
    ambient: { color: "#f8efe4", ground: "#332a24", intensity: 0.5 },
    envIntensity: 0.35
  },

  editorial: {
    id: "editorial",
    label: "Editorial Contrast",
    description: "High-contrast directional lighting that sculpts body silhouette and fabric folds.",
    keyLight: { color: "#ffffff", intensity: 3.0, position: [-3.0, 3.8, 2.2] },
    fillLight: { color: "#b8cbe0", intensity: 0.4, position: [3.4, 1.6, 0.8] },
    rimLight: { color: "#fff0e0", intensity: 1.6, position: [0.0, 2.6, -3.4] },
    spotLight: { color: "#ffffff", intensity: 0.3, position: [0, 4.0, 2.0] },
    ambient: { color: "#ece6de", ground: "#221d18", intensity: 0.4 },
    envIntensity: 0.25
  },

  warm: {
    id: "warm",
    label: "Golden Hour Glow",
    description: "Warm sunset studio lighting with rich copper rim highlights.",
    keyLight: { color: "#ffd4aa", intensity: 2.4, position: [-2.5, 3.2, 2.8] },
    fillLight: { color: "#e8c8b4", intensity: 0.8, position: [2.8, 2.0, 1.2] },
    rimLight: { color: "#ffaa66", intensity: 1.8, position: [0.3, 2.6, -3.0] },
    spotLight: { color: "#ffeedd", intensity: 0.5, position: [0, 4.0, 2.0] },
    ambient: { color: "#fae0cc", ground: "#402618", intensity: 0.65 },
    envIntensity: 0.45
  },

  cool: {
    id: "cool",
    label: "Cool Daylight Minimal",
    description: "Clean, neutral-cool daylight studio light with balanced tones.",
    keyLight: { color: "#eaf2ff", intensity: 2.2, position: [-2.0, 3.6, 3.0] },
    fillLight: { color: "#dbe6f8", intensity: 0.85, position: [2.8, 2.2, 1.5] },
    rimLight: { color: "#ffffff", intensity: 1.0, position: [0.2, 2.8, -3.2] },
    spotLight: { color: "#f0f6ff", intensity: 0.45, position: [0, 4.0, 2.0] },
    ambient: { color: "#e8effc", ground: "#2a303a", intensity: 0.6 },
    envIntensity: 0.4
  },

  dramatic: {
    id: "dramatic",
    label: "Dramatic Spotlight",
    description: "Low key, atmospheric runway spotlight with grounded shadow drama.",
    keyLight: { color: "#fff0e6", intensity: 3.4, position: [-1.4, 4.2, 2.0] },
    fillLight: { color: "#9cb4d0", intensity: 0.25, position: [2.5, 1.5, 1.0] },
    rimLight: { color: "#ffdfc0", intensity: 2.0, position: [0.0, 3.0, -2.6] },
    spotLight: { color: "#ffffff", intensity: 1.2, position: [0, 4.8, 1.2] },
    ambient: { color: "#d0c4b8", ground: "#14100c", intensity: 0.3 },
    envIntensity: 0.2
  }
};

export const STUDIO_BACKDROPS = {
  dark: { id: "dark", label: "Dark Studio", hex: "#0b0b0c", ground: "#121110" },
  warm: { id: "warm", label: "Warm Noir", hex: "#181412", ground: "#1c1815" },
  gray: { id: "gray", label: "Minimal Gray", hex: "#1a1a1d", ground: "#222226" },
  editorial: { id: "editorial", label: "Editorial Ivory", hex: "#eae6de", ground: "#dcd6cb" }
};

export const CAMERA_PRESETS = {
  studio: {
    id: "studio",
    label: "Studio Full Body",
    position: [0, 1.05, 3.35],
    target: [0, 0.92, 0],
    fov: 32
  },
  portrait: {
    id: "portrait",
    label: "Portrait (3/4)",
    position: [0.85, 1.25, 2.0],
    target: [0, 1.22, 0],
    fov: 28
  },
  beauty: {
    id: "beauty",
    label: "Beauty Close-Up",
    position: [0, 1.56, 1.05],
    target: [0, 1.54, 0],
    fov: 24
  },
  runway: {
    id: "runway",
    label: "Runway Front",
    position: [0, 0.75, 3.8],
    target: [0, 1.0, 0],
    fov: 34
  },
  side: {
    id: "side",
    label: "Side Profile",
    position: [3.2, 1.05, 0.15],
    target: [0, 0.92, 0],
    fov: 32
  },
  back: {
    id: "back",
    label: "Back View",
    position: [0, 1.08, -3.35],
    target: [0, 0.92, 0],
    fov: 32
  }
};
