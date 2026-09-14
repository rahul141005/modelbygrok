/**
 * Coordinated Editorial Expression System for Solenne
 * Drives coordinated micro-displacements across eyes, brows, cheeks, and lips.
 * Fashion-oriented, subtle, and natural (no cartoonish exaggerated deformation).
 */

export const EXPRESSIONS = {
  neutral: {
    id: "neutral",
    label: "Neutral Editorial",
    mouthCornerY: 0.0,
    mouthWidth: 0.0,
    upperLipLift: 0.0,
    lowerLipDepress: 0.0,
    cheekLift: 0.0,
    browLift: 0.0,
    browTilt: 0.0,
    eyeSquint: 0.0,
    gazeBias: [0, 0]
  },

  subtleSmile: {
    id: "subtleSmile",
    label: "Subtle Smile",
    mouthCornerY: 0.0035,
    mouthWidth: 0.002,
    upperLipLift: 0.0015,
    lowerLipDepress: 0.001,
    cheekLift: 0.004,
    browLift: 0.001,
    browTilt: 0.0,
    eyeSquint: 0.002,
    gazeBias: [0, 0]
  },

  happy: {
    id: "happy",
    label: "Radiant & Warm",
    mouthCornerY: 0.007,
    mouthWidth: 0.005,
    upperLipLift: 0.0035,
    lowerLipDepress: 0.0025,
    cheekLift: 0.008,
    browLift: 0.003,
    browTilt: -0.02,
    eyeSquint: 0.005,
    gazeBias: [0, 0]
  },

  confident: {
    id: "confident",
    label: "Confident Runway",
    mouthCornerY: 0.0015,
    mouthWidth: 0.001,
    upperLipLift: 0.0,
    lowerLipDepress: 0.0,
    cheekLift: 0.002,
    browLift: -0.001,
    browTilt: 0.03,
    eyeSquint: 0.002,
    gazeBias: [0, 0]
  },

  relaxed: {
    id: "relaxed",
    label: "Soft & Relaxed",
    mouthCornerY: 0.001,
    mouthWidth: 0.0,
    upperLipLift: 0.0,
    lowerLipDepress: 0.0,
    cheekLift: 0.001,
    browLift: -0.001,
    browTilt: -0.01,
    eyeSquint: -0.001,
    gazeBias: [0, -0.01]
  },

  surprised: {
    id: "surprised",
    label: "Curious / Surprised",
    mouthCornerY: -0.001,
    mouthWidth: -0.003,
    upperLipLift: 0.004,
    lowerLipDepress: 0.005,
    cheekLift: 0.002,
    browLift: 0.007,
    browTilt: 0.0,
    eyeSquint: -0.004,
    gazeBias: [0, 0.02]
  },

  thoughtful: {
    id: "thoughtful",
    label: "Thoughtful & Pensive",
    mouthCornerY: 0.0,
    mouthWidth: -0.001,
    upperLipLift: 0.001,
    lowerLipDepress: -0.001,
    cheekLift: 0.001,
    browLift: 0.002,
    browTilt: -0.03,
    eyeSquint: 0.001,
    gazeBias: [0.03, -0.015]
  },

  serious: {
    id: "serious",
    label: "High-Fashion Editorial",
    mouthCornerY: -0.002,
    mouthWidth: 0.001,
    upperLipLift: -0.001,
    lowerLipDepress: 0.0,
    cheekLift: -0.001,
    browLift: -0.003,
    browTilt: 0.02,
    eyeSquint: 0.001,
    gazeBias: [0, 0]
  },

  playful: {
    id: "playful",
    label: "Playful Smirk",
    mouthCornerY: 0.005,
    mouthWidth: 0.002,
    upperLipLift: 0.002,
    lowerLipDepress: 0.001,
    cheekLift: 0.005,
    browLift: 0.003,
    browTilt: 0.04,
    eyeSquint: 0.003,
    gazeBias: [-0.02, 0.01]
  }
};

export function getExpressionData(name) {
  return EXPRESSIONS[name] || EXPRESSIONS.neutral;
}
