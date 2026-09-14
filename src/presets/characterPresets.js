/**
 * Solenne Character Studio — Curated Presets
 * Each preset coordinates facial features, hair, body, pose, wardrobe, accessories, and studio setup.
 */

export const CHARACTER_PRESETS = {
  reference: {
    id: "reference",
    name: "Solenne — Canonical Reference",
    description: "The intended reference standard directly from the visual design sheet.",
    body: {
      heightScale: 1.0,      // 170 cm
      shoulderWidth: 0.0,
      armVolume: 1.0,
      waistDepth: 1.0,
      thighThickness: 1.0,
      calfThickness: 1.0,
      bust: 0.42,
      hips: 0.48,
      preset: "natural"
    },
    face: {
      faceWidth: 0.0,
      jawWidth: 0.0,
      chinSize: 0.0,
      chinProj: 0.0,
      eyeSpacing: 0.0,
      eyeSize: 0.0,
      noseBridge: 0.0,
      noseTip: 0.0,
      lipFullness: 0.0,
      cheekFullness: 0.0
    },
    expression: "neutral",
    eyes: {
      irisColor: "hazelGreen",
      pupilSize: 0.32,
      eyeWetness: 1.0,
      gazeX: 0.0,
      gazeY: 0.0
    },
    hair: {
      style: "waves",
      color: "darkChestnut"
    },
    pose: "neutral",
    wardrobe: {
      category: "casual",
      top: "cropTank",
      bottom: "denimShorts",
      dress: "none",
      outerwear: "none",
      shoes: "barefoot",
      colorTheme: "default",
      fabricType: "cotton"
    },
    accessories: {
      earrings: "none",
      necklace: "none",
      bracelet: "none",
      sunglasses: "none",
      rings: "none"
    },
    beauty: {
      blush: "none",
      eyeliner: "none",
      eyeshadow: "none",
      lipstick: "natural",
      freckles: 0.45,
      nailColor: "nude"
    },
    camera: "studio",
    lighting: "softStudio"
  },

  editorial: {
    id: "editorial",
    name: "Solenne — Editorial Runway",
    description: "Dramatic high-fashion runway aesthetic with structured tailoring and sharp gaze.",
    body: {
      heightScale: 1.04,
      shoulderWidth: 0.015,
      armVolume: 0.95,
      waistDepth: 0.95,
      thighThickness: 0.95,
      calfThickness: 0.95,
      bust: 0.35,
      hips: 0.45,
      preset: "tall"
    },
    face: {
      faceWidth: -0.05,
      jawWidth: 0.02,
      chinSize: 0.0,
      chinProj: 0.01,
      eyeSpacing: 0.0,
      eyeSize: 0.05,
      noseBridge: 0.0,
      noseTip: -0.02,
      lipFullness: 0.05,
      cheekFullness: -0.05
    },
    expression: "confident",
    eyes: {
      irisColor: "hazelGreen",
      pupilSize: 0.28,
      eyeWetness: 1.0,
      gazeX: 0.0,
      gazeY: 0.0
    },
    hair: {
      style: "ponytail",
      color: "espressoBlack"
    },
    pose: "editorial",
    wardrobe: {
      category: "tailored",
      top: "blazer",
      bottom: "trousers",
      dress: "none",
      outerwear: "blazer",
      shoes: "stilettos",
      colorTheme: "noir",
      fabricType: "wool"
    },
    accessories: {
      earrings: "goldHoops",
      necklace: "pendant",
      bracelet: "goldBangle",
      sunglasses: "none",
      rings: "goldBand"
    },
    beauty: {
      blush: "roseGlow",
      eyeliner: "wing",
      eyeshadow: "bronze",
      lipstick: "wine",
      freckles: 0.2,
      nailColor: "espresso"
    },
    camera: "runway",
    lighting: "dramatic"
  },

  casual: {
    id: "casual",
    name: "Solenne — Casual Chic",
    description: "Effortless weekend style with ribbed cotton tank and distressed denim.",
    body: {
      heightScale: 1.0,
      shoulderWidth: 0.0,
      armVolume: 1.0,
      waistDepth: 1.0,
      thighThickness: 1.0,
      calfThickness: 1.0,
      bust: 0.42,
      hips: 0.48,
      preset: "natural"
    },
    face: {
      faceWidth: 0.0,
      jawWidth: 0.0,
      chinSize: 0.0,
      chinProj: 0.0,
      eyeSpacing: 0.0,
      eyeSize: 0.0,
      noseBridge: 0.0,
      noseTip: 0.0,
      lipFullness: 0.0,
      cheekFullness: 0.0
    },
    expression: "subtleSmile",
    eyes: {
      irisColor: "hazelGreen",
      pupilSize: 0.34,
      eyeWetness: 1.0,
      gazeX: 0.02,
      gazeY: -0.01
    },
    hair: {
      style: "waves",
      color: "warmChestnut"
    },
    pose: "relaxed",
    wardrobe: {
      category: "casual",
      top: "cropTank",
      bottom: "denimShorts",
      dress: "none",
      outerwear: "none",
      shoes: "slides",
      colorTheme: "default",
      fabricType: "cotton"
    },
    accessories: {
      earrings: "silverHoops",
      necklace: "none",
      bracelet: "none",
      sunglasses: "none",
      rings: "silverRing"
    },
    beauty: {
      blush: "softPeach",
      eyeliner: "none",
      eyeshadow: "none",
      lipstick: "gloss",
      freckles: 0.5,
      nailColor: "nude"
    },
    camera: "studio",
    lighting: "warm"
  },

  traditional: {
    id: "traditional",
    name: "Solenne — Traditional Elegance",
    description: "Contemporary ethnic fashion with modern tailored kurta silhouette and gold jewelry.",
    body: {
      heightScale: 1.01,
      shoulderWidth: 0.0,
      armVolume: 1.0,
      waistDepth: 0.98,
      thighThickness: 1.0,
      calfThickness: 1.0,
      bust: 0.45,
      hips: 0.52,
      preset: "soft"
    },
    face: {
      faceWidth: 0.0,
      jawWidth: -0.02,
      chinSize: 0.0,
      chinProj: 0.0,
      eyeSpacing: 0.0,
      eyeSize: 0.03,
      noseBridge: 0.0,
      noseTip: 0.0,
      lipFullness: 0.08,
      cheekFullness: 0.03
    },
    expression: "happy",
    eyes: {
      irisColor: "honeyAmber",
      pupilSize: 0.32,
      eyeWetness: 1.0,
      gazeX: 0.0,
      gazeY: 0.0
    },
    hair: {
      style: "bun",
      color: "espressoBlack"
    },
    pose: "handOnHip",
    wardrobe: {
      category: "traditional",
      top: "kurta",
      bottom: "trousers",
      dress: "none",
      outerwear: "robe",
      shoes: "slides",
      colorTheme: "royalEmerald",
      fabricType: "silk"
    },
    accessories: {
      earrings: "dropPearls",
      necklace: "pendant",
      bracelet: "goldBangle",
      sunglasses: "none",
      rings: "goldBand"
    },
    beauty: {
      blush: "roseGlow",
      eyeliner: "wing",
      eyeshadow: "bronze",
      lipstick: "rose",
      freckles: 0.15,
      nailColor: "crimson"
    },
    camera: "portrait",
    lighting: "beauty"
  },

  evening: {
    id: "evening",
    name: "Solenne — Evening Glamour",
    description: "Sleek silk slip dress with cowl neckline, statement earrings, and red lips.",
    body: {
      heightScale: 1.02,
      shoulderWidth: 0.0,
      armVolume: 0.98,
      waistDepth: 0.96,
      thighThickness: 1.02,
      calfThickness: 1.0,
      bust: 0.48,
      hips: 0.54,
      preset: "curvy"
    },
    face: {
      faceWidth: -0.02,
      jawWidth: -0.01,
      chinSize: 0.0,
      chinProj: 0.0,
      eyeSpacing: 0.0,
      eyeSize: 0.04,
      noseBridge: 0.0,
      noseTip: -0.01,
      lipFullness: 0.1,
      cheekFullness: 0.02
    },
    expression: "playful",
    eyes: {
      irisColor: "hazelGreen",
      pupilSize: 0.35,
      eyeWetness: 1.0,
      gazeX: -0.02,
      gazeY: 0.01
    },
    hair: {
      style: "curls",
      color: "chocolate"
    },
    pose: "oneLegRelaxed",
    wardrobe: {
      category: "evening",
      top: "none",
      bottom: "none",
      dress: "satinSlip",
      outerwear: "none",
      shoes: "stilettos",
      colorTheme: "burgundy",
      fabricType: "satin"
    },
    accessories: {
      earrings: "dropPearls",
      necklace: "none",
      bracelet: "goldBangle",
      sunglasses: "none",
      rings: "goldBand"
    },
    beauty: {
      blush: "roseGlow",
      eyeliner: "wing",
      eyeshadow: "taupe",
      lipstick: "crimson",
      freckles: 0.25,
      nailColor: "crimson"
    },
    camera: "beauty",
    lighting: "softStudio"
  },

  summer: {
    id: "summer",
    name: "Solenne — Summer Sun",
    description: "Breezy floral sundress, sunglasses, half-up hair, and golden hour studio glow.",
    body: {
      heightScale: 1.0,
      shoulderWidth: 0.0,
      armVolume: 1.0,
      waistDepth: 1.0,
      thighThickness: 1.0,
      calfThickness: 1.0,
      bust: 0.42,
      hips: 0.48,
      preset: "natural"
    },
    face: {
      faceWidth: 0.0,
      jawWidth: 0.0,
      chinSize: 0.0,
      chinProj: 0.0,
      eyeSpacing: 0.0,
      eyeSize: 0.0,
      noseBridge: 0.0,
      noseTip: 0.0,
      lipFullness: 0.02,
      cheekFullness: 0.04
    },
    expression: "happy",
    eyes: {
      irisColor: "hazelGreen",
      pupilSize: 0.32,
      eyeWetness: 1.0,
      gazeX: 0.0,
      gazeY: 0.0
    },
    hair: {
      style: "halfUp",
      color: "honeyHighlights"
    },
    pose: "walking",
    wardrobe: {
      category: "summer",
      top: "none",
      bottom: "none",
      dress: "sundress",
      outerwear: "robe",
      shoes: "slides",
      colorTheme: "champagne",
      fabricType: "linen"
    },
    accessories: {
      earrings: "goldHoops",
      necklace: "none",
      bracelet: "none",
      sunglasses: "catEye",
      rings: "none"
    },
    beauty: {
      blush: "softPeach",
      eyeliner: "none",
      eyeshadow: "none",
      lipstick: "gloss",
      freckles: 0.6,
      nailColor: "nude"
    },
    camera: "studio",
    lighting: "warm"
  }
};
