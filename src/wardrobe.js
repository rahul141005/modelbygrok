export const WARDROBE = {
  lingerie: {
    id: "GAR-LINGERIE-01",
    label: "Lingerie",
    pieces: ["Soft-cup bra", "High-hip brief"],
    fabric: "Matte microfiber with fine knit (not cartoon lace)",
    pbr: { roughness: 0.55, sheen: 0.8, color: "#2a1c22" },
    notes: "Thin offset shell (6–7mm). Tension at underbust band; sits above hip morph zone on the brief."
  },
  casual: {
    id: "GAR-CASUAL-01",
    label: "Casual",
    pieces: ["Fitted cotton tee", "Mid-rise denim"],
    fabric: "Combed cotton jersey + mid-weight denim twill",
    pbr: { topRoughness: 0.72, denimRoughness: 0.68, top: "#e6dfd2", denim: "#4a5868" },
    notes: "Thicker shells (12–14mm). Shoulder tension, waist compression, gravity folds on denim hem."
  },
  dress: {
    id: "GAR-DRESS-01",
    label: "Dress",
    pieces: ["Bias midi sheath"],
    fabric: "Silk-blend crepe",
    pbr: { roughness: 0.38, sheen: 0.45, color: "#7a2430" },
    notes: "16mm offset, extra front drape. Covers lingerie/casual when on."
  },
  robe: {
    id: "GAR-ROBE-01",
    label: "Robe",
    pieces: ["Open wrap cover-up"],
    fabric: "Washed silk charmeuse",
    pbr: { roughness: 0.34, sheen: 0.7, color: "#c9b7a4" },
    notes: "Transition layer. Open front; hangs off shoulders; does not replace inner garments."
  }
};

