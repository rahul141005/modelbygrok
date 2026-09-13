export const MORPH_SPEC = {
  naming: {
    bust: ["Bust_0", "Bust_50", "Bust_100"],
    hips: ["Hips_0", "Hips_50", "Hips_100"]
  },
  sliderToWeight: {
    note: "UI sliders are 0–1. Neutral/default is not 0.",
    bust: { slider: [0, 0.42, 1], weight: [0, 50, 100], defaultSlider: 0.42 },
    hips: { slider: [0, 0.48, 1], weight: [0, 50, 100], defaultSlider: 0.48 }
  },
  runtime: {
    bustAmt: "(slider - 0.42) / 0.58",
    hipAmt: "(slider - 0.48) / 0.52",
    apply: "position = base + bustDelta * bustAmt + hipDelta * hipAmt"
  },
  preserved: ["height", "head scale", "shoulder width", "limb length", "ribcage bone", "pelvis bone"],
  tissueOnly: "Soft tissue: bust volume, hip/glute volume. No joint stretch.",
  clothing: {
    safe: "0.15–0.85 on both sliders",
    caution: "0.05–0.15 and 0.85–0.95: thin garments may clip at underbust / hip crest",
    fail: "<0.05 or >0.95 with dress+robe stacked: hem collision possible"
  },
  grid: [
    { id: "Bust_0-Hips_0", bust: 0, hips: 0, label: "Bust 0 / Hips 0" },
    { id: "Bust_0-Hips_50", bust: 0, hips: 0.48, label: "Bust 0 / Hips 50" },
    { id: "Bust_0-Hips_100", bust: 0, hips: 1, label: "Bust 0 / Hips 100" },
    { id: "Bust_50-Hips_0", bust: 0.42, hips: 0, label: "Bust 50 / Hips 0" },
    { id: "Bust_50-Hips_50", bust: 0.42, hips: 0.48, label: "Bust 50 / Hips 50" },
    { id: "Bust_50-Hips_100", bust: 0.42, hips: 1, label: "Bust 50 / Hips 100" },
    { id: "Bust_100-Hips_0", bust: 1, hips: 0, label: "Bust 100 / Hips 0" },
    { id: "Bust_100-Hips_50", bust: 1, hips: 0.48, label: "Bust 100 / Hips 50" },
    { id: "Bust_100-Hips_100", bust: 1, hips: 1, label: "Bust 100 / Hips 100" }
  ]
};

export function morphLabel(value, kind) {
  if (kind === "bust") {
    if (value <= 0.14) return "Bust_0";
    if (value >= 0.78) return "Bust_100";
    return "Bust_50";
  }
  if (value <= 0.16) return "Hips_0";
  if (value >= 0.82) return "Hips_100";
  return "Hips_50";
}
