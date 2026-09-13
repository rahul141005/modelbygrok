export const MODEL_BIBLE = {
  id: "SYN-F-SOLENNE-28",
  name: "Solenne Moreau",
  legal: "Fictional synthetic identity. Not based on any real person.",
  age: 28,
  ageRange: "25–32",
  heightCm: 176,
  weightKg: 61,
  ethnicityNote: "Mediterranean / Northern European mix (invented)",
  skin: {
    fitzpatrick: "III",
    undertone: "neutral-warm",
    hex: "#c49a80",
    notes: "Visible pores, faint freckling across nose and décolletage, natural subsurface warmth."
  },
  hair: {
    color: "Dark chestnut brown",
    hex: "#2a1a12",
    length: "Mid-back",
    texture: "Soft natural wave, fine-medium density"
  },
  eyes: {
    color: "Hazel-green",
    hex: "#6b7344",
    notes: "Limbal ring present, catchlights from studio key."
  },
  face: {
    shape: "Oval with defined zygoma",
    nose: "Straight, medium bridge",
    lips: "Medium, natural rose",
    brows: "Soft arch, natural density"
  },
  defaultMeasurements: {
    bustCm: 89,
    waistCm: 66,
    hipsCm: 96,
    inseamCm: 84,
    shoulderCm: 40
  },
  morphRange: {
    bust: { minLabel: "Bust_0", midLabel: "Bust_50", maxLabel: "Bust_100", notes: "Soft-tissue scale only; ribcage fixed." },
    hips: { minLabel: "Hips_0", midLabel: "Hips_50", maxLabel: "Hips_100", notes: "Pelvis width + hip soft tissue; waist remains defined." }
  },
  lighting: "High-key fashion studio, large soft key camera-left, cool fill, hair rim, grounded bounce.",
  lightingBeauty: "Soft beauty key camera-left, large octabox, low fill, hair rim +0.3 stop.",
  pose: "Relaxed T / standing A-pose, weight slightly left, full body in frame.",
  marks: "None. Minimal identity: faint freckling only.",
  usage: "Virtual fashion visualization. Face-from-upload permitted only on clothed looks with adult attestation."
};

export const HERO_VIEWS = {
  front: { position: [0, 1.05, 3.35], target: [0, 0.92, 0], label: "Front" },
  threeQuarter: { position: [1.85, 1.12, 2.85], target: [0, 0.94, 0], label: "3/4" },
  side: { position: [3.2, 1.05, 0.15], target: [0, 0.92, 0], label: "Side" },
  back: { position: [0, 1.08, -3.35], target: [0, 0.92, 0], label: "Back" }
};
