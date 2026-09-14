import * as THREE from "three";

/**
 * Creates high-fidelity canvas-generated procedural textures for the Solenne model.
 * Inspired directly by the texture panels in reference.png.
 */

// Helper to convert canvas to Three.js texture with optimal filtering
function createTexture(canvas, options = {}) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = options.colorSpace || THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = options.wrapS || THREE.RepeatWrapping;
  tex.wrapT = options.wrapT || THREE.RepeatWrapping;
  if (options.repeat) tex.repeat.set(options.repeat[0], options.repeat[1]);
  tex.needsUpdate = true;
  return tex;
}

// 1. Procedural Iris Texture (Hazel-green with radiating fibers and dark limbal ring)
export function makeIrisTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  // Background sclera base
  ctx.fillStyle = "#181816";
  ctx.fillRect(0, 0, size, size);

  // Outer dark limbal ring
  const limbal = ctx.createRadialGradient(cx, cy, r * 0.7, cx, cy, r);
  limbal.addColorStop(0, "#2d3522");
  limbal.addColorStop(0.85, "#171c12");
  limbal.addColorStop(1, "#0d0f0a");
  ctx.fillStyle = limbal;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Iris body: hazel-green blend with amber collarette
  const irisGrad = ctx.createRadialGradient(cx, cy, r * 0.25, cx, cy, r * 0.85);
  irisGrad.addColorStop(0, "#7a6a3b"); // amber inner ring
  irisGrad.addColorStop(0.4, "#5d6e42"); // hazel-green body
  irisGrad.addColorStop(0.8, "#3e4c2c"); // deep olive
  irisGrad.addColorStop(1, "#222a18");
  ctx.fillStyle = irisGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
  ctx.fill();

  // Radiating iris stroma fibers
  ctx.lineWidth = 1.2;
  const fiberCount = 180;
  for (let i = 0; i < fiberCount; i++) {
    const angle = (i / fiberCount) * Math.PI * 2;
    const innerDist = r * 0.28 + Math.random() * (r * 0.08);
    const outerDist = r * 0.82 - Math.random() * (r * 0.05);

    const x1 = cx + Math.cos(angle) * innerDist;
    const y1 = cy + Math.sin(angle) * innerDist;
    const x2 = cx + Math.cos(angle) * outerDist;
    const y2 = cy + Math.sin(angle) * outerDist;

    ctx.strokeStyle = i % 2 === 0 ? "rgba(164, 182, 120, 0.45)" : "rgba(196, 160, 90, 0.4)";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Pupil center (deep black)
  const pupil = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.32);
  pupil.addColorStop(0, "#080606");
  pupil.addColorStop(0.85, "#0a0808");
  pupil.addColorStop(1, "rgba(20, 15, 12, 0.8)");
  ctx.fillStyle = pupil;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.32, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

// 2. Procedural Skin Micro-Normal Map (subtle pores and fine grain)
export function makeSkinMicroNormal() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const img = ctx.createImageData(size, size);
  const data = img.data;

  // Generate subtle high-frequency tangent normal perturbation
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      // High-frequency skin grain
      const n1 = Math.sin(x * 0.75) * Math.cos(y * 0.75);
      const n2 = Math.sin(x * 1.8 + y * 0.9) * 0.5;
      const n3 = (Math.random() - 0.5) * 0.8;
      const val = (n1 + n2 + n3) * 6;

      data[idx] = Math.min(255, Math.max(0, 128 + val)); // tangent X
      data[idx + 1] = Math.min(255, Math.max(0, 128 + val * 0.8)); // tangent Y
      data[idx + 2] = 255; // normal Z (upwards)
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

// 3. Procedural Skin Albedo Map (Euro-Mediterranean warmth, décolletage flush, subtle pore tone)
export function makeSkinAlbedo() {
  const w = 1024;
  const h = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Vertical body gradient matching Solenne reference
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#dcc3b0");    // neck/clavicle
  g.addColorStop(0.2, "#d5b9a4");  // bust/chest
  g.addColorStop(0.35, "#cfaf99"); // waist/abdomen
  g.addColorStop(0.5, "#d3b39e");  // hips
  g.addColorStop(0.7, "#cca993");  // thighs
  g.addColorStop(0.9, "#d6b5a0");  // calves
  g.addColorStop(1.0, "#d8b7a2");  // feet
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Soft warm subsurface flush at chest / breast contour
  ctx.save();
  ctx.globalAlpha = 0.15;
  const flush = ctx.createRadialGradient(w * 0.5, h * 0.28, 40, w * 0.5, h * 0.28, 260);
  flush.addColorStop(0, "#d67c6e");
  flush.addColorStop(1, "rgba(214, 124, 110, 0)");
  ctx.fillStyle = flush;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.28, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Subtle natural skin grain / micro-variation
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 7;
    d[i] = Math.min(255, Math.max(0, d[i] + noise + 1));     // red warmth
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + noise));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + noise - 1));
  }
  ctx.putImageData(img, 0, 0);

  return canvas;
}

// 4. Procedural Face Texture (Natural European/Mediterranean portrait with cheek flush, lips, brow tones)
export function makeFaceTexture() {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Neutral-warm base
  ctx.fillStyle = "#d8bda9";
  ctx.fillRect(0, 0, size, size);

  // Forehead highlight gradient
  const fhead = ctx.createRadialGradient(512, 280, 50, 512, 280, 300);
  fhead.addColorStop(0, "rgba(235, 218, 205, 0.4)");
  fhead.addColorStop(1, "rgba(216, 189, 169, 0)");
  ctx.fillStyle = fhead;
  ctx.fillRect(0, 0, size, size);

  // High cheekbone blush / warmth (Solenne reference)
  const leftCheek = ctx.createRadialGradient(340, 560, 20, 340, 560, 180);
  leftCheek.addColorStop(0, "rgba(208, 120, 110, 0.35)");
  leftCheek.addColorStop(0.7, "rgba(208, 120, 110, 0.1)");
  leftCheek.addColorStop(1, "rgba(208, 120, 110, 0)");
  ctx.fillStyle = leftCheek;
  ctx.fillRect(0, 0, size, size);

  const rightCheek = ctx.createRadialGradient(684, 560, 20, 684, 560, 180);
  rightCheek.addColorStop(0, "rgba(208, 120, 110, 0.35)");
  rightCheek.addColorStop(0.7, "rgba(208, 120, 110, 0.1)");
  rightCheek.addColorStop(1, "rgba(208, 120, 110, 0)");
  ctx.fillStyle = rightCheek;
  ctx.fillRect(0, 0, size, size);

  // Natural brow shadows / shape
  ctx.fillStyle = "#382419";
  ctx.globalAlpha = 0.55;
  // Left soft arched eyebrow
  ctx.beginPath();
  ctx.ellipse(365, 425, 75, 14, -0.15, 0, Math.PI * 2);
  ctx.fill();
  // Right soft arched eyebrow
  ctx.beginPath();
  ctx.ellipse(659, 425, 75, 14, 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1.0;

  // Soft nose contouring and tip highlight
  ctx.fillStyle = "rgba(180, 110, 95, 0.18)";
  ctx.beginPath();
  ctx.moveTo(480, 440);
  ctx.lineTo(465, 630);
  ctx.lineTo(559, 630);
  ctx.lineTo(544, 440);
  ctx.closePath();
  ctx.fill();

  // Subtle nostril accents
  ctx.fillStyle = "rgba(80, 40, 30, 0.4)";
  ctx.beginPath();
  ctx.ellipse(482, 632, 10, 5, -0.2, 0, Math.PI * 2);
  ctx.ellipse(542, 632, 10, 5, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Contoured rose lips (matching lip detail in reference.png)
  const lipGradient = ctx.createRadialGradient(512, 735, 10, 512, 735, 80);
  lipGradient.addColorStop(0, "#be6b6e");
  lipGradient.addColorStop(0.6, "#aa585c");
  lipGradient.addColorStop(1, "rgba(170, 88, 92, 0)");
  ctx.fillStyle = lipGradient;
  ctx.beginPath();
  ctx.ellipse(512, 730, 68, 28, 0, 0, Math.PI * 2);
  ctx.fill();

  // Delicate freckles across nose and upper cheeks (Solenne model bible feature)
  ctx.fillStyle = "rgba(140, 85, 60, 0.28)";
  for (let i = 0; i < 45; i++) {
    const fx = 512 + (Math.random() - 0.5) * 320;
    const fy = 540 + (Math.random() - 0.5) * 110;
    const fr = 0.8 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.arc(fx, fy, fr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Micro skin noise
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 8;
    d[i] = Math.min(255, Math.max(0, d[i] + n));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n * 0.9));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n * 0.8));
  }
  ctx.putImageData(img, 0, 0);

  return canvas;
}

// 5. Procedural Fabric Textures
export function makeRibbedCottonTexture() {
  const s = 256;
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = "#f0ede8";
  ctx.fillRect(0, 0, s, s);

  // Vertical knit ribs
  ctx.fillStyle = "#ded9d0";
  for (let x = 0; x < s; x += 8) {
    ctx.fillRect(x, 0, 4, s);
  }

  const img = ctx.getImageData(0, 0, s, s);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 16;
    d[i] = Math.min(255, Math.max(0, d[i] + n));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

export function makeDenimTexture() {
  const s = 256;
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = "#4a6382";
  ctx.fillRect(0, 0, s, s);

  // Twill diagonal weave
  const img = ctx.getImageData(0, 0, s, s);
  const d = img.data;
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const idx = (y * s + x) * 4;
      const twill = (x + y * 2) % 6 === 0 ? 30 : -15;
      const n = (Math.random() - 0.5) * 18;
      const v = twill + n;
      d[idx] = Math.min(255, Math.max(0, d[idx] + v * 0.7));
      d[idx + 1] = Math.min(255, Math.max(0, d[idx + 1] + v * 0.8));
      d[idx + 2] = Math.min(255, Math.max(0, d[idx + 2] + v * 1.1));
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

export function makeLaceTexture() {
  const s = 256;
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.fillStyle = "#121012";
  ctx.fillRect(0, 0, s, s);

  // Floral/scallop fine mesh pattern
  ctx.strokeStyle = "rgba(45, 36, 42, 0.85)";
  ctx.lineWidth = 1.5;
  for (let x = 0; x < s; x += 16) {
    for (let y = 0; y < s; y += 16) {
      ctx.beginPath();
      ctx.arc(x + 8, y + 8, 6, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  return canvas;
}

/**
 * Singleton Material Library for Solenne
 */
let materialCache = null;
let previousFaceTexture = null;

export function getSolenneMaterials() {
  if (materialCache) return materialCache;

  const skinNormalCanvas = makeSkinMicroNormal();
  const skinNormalMap = createTexture(skinNormalCanvas, { repeat: [12, 12] });
  skinNormalMap.colorSpace = THREE.NoColorSpace;

  const bodyAlbedoMap = createTexture(makeSkinAlbedo());
  const faceAlbedoMap = createTexture(makeFaceTexture());
  const irisMap = createTexture(makeIrisTexture());
  const cottonMap = createTexture(makeRibbedCottonTexture(), { repeat: [8, 8] });
  const denimMap = createTexture(makeDenimTexture(), { repeat: [6, 6] });
  const laceMap = createTexture(makeLaceTexture(), { repeat: [10, 10] });

  // 1. Photorealistic Physical Skin Material
  const skin = new THREE.MeshPhysicalMaterial({
    map: bodyAlbedoMap,
    normalMap: skinNormalMap,
    normalScale: new THREE.Vector2(0.22, 0.22),
    color: "#e2c8b6",
    roughness: 0.44,
    metalness: 0.0,
    sheen: 0.55,
    sheenRoughness: 0.35,
    sheenColor: new THREE.Color("#d47a6b"), // Warm epidermal scattering tint
    clearcoat: 0.12,
    clearcoatRoughness: 0.45,
    reflectivity: 0.5
  });

  // 2. Face Material (shares skin properties with facial albedo)
  const face = skin.clone();
  face.map = faceAlbedoMap;
  face.normalScale = new THREE.Vector2(0.18, 0.18);
  face.roughness = 0.42;
  face.clearcoat = 0.16; // Slight T-zone sheen

  // 3. Eye Cornea / Sclera / Iris Materials
  const eyeSclera = new THREE.MeshPhysicalMaterial({
    color: "#faf6f0",
    roughness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    sheen: 0.2,
    sheenColor: new THREE.Color("#f0e0d8")
  });

  const eyeIris = new THREE.MeshStandardMaterial({
    map: irisMap,
    roughness: 0.15,
    metalness: 0.05
  });

  const eyeCornea = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    roughness: 0.02,
    transmission: 0.96,
    thickness: 0.04,
    ior: 1.376, // Physiological corneal index of refraction
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    transparent: true,
    opacity: 0.98
  });

  // 4. Volumetric Hair Material
  const hair = new THREE.MeshPhysicalMaterial({
    color: "#2a1a12", // Rich dark chestnut
    roughness: 0.36,
    metalness: 0.08,
    sheen: 0.85,
    sheenRoughness: 0.32,
    sheenColor: new THREE.Color("#6b442e"), // Warm copper/amber anisotropic sheen
    clearcoat: 0.25,
    clearcoatRoughness: 0.35,
    side: THREE.DoubleSide
  });

  // 5. Manicure / Nails
  const nail = new THREE.MeshPhysicalMaterial({
    color: "#c98f8c",
    roughness: 0.22,
    clearcoat: 0.7,
    clearcoatRoughness: 0.15
  });

  // 6. Wardrobe PBR Materials
  // A. Minimalist Underwear (Base "None")
  const neutralUnderwear = new THREE.MeshPhysicalMaterial({
    color: "#d2b39e",
    roughness: 0.62,
    sheen: 0.35,
    sheenColor: new THREE.Color("#edd2c2"),
    side: THREE.DoubleSide
  });

  // B. Lingerie (Black delicate lace)
  const lingerie = new THREE.MeshPhysicalMaterial({
    map: laceMap,
    color: "#181416",
    roughness: 0.58,
    sheen: 0.7,
    sheenColor: new THREE.Color("#3d2834"),
    side: THREE.DoubleSide
  });

  // C. Casual Outfit: Ribbed White Crop Tank + Faded Denim Shorts
  const casualTop = new THREE.MeshPhysicalMaterial({
    map: cottonMap,
    color: "#f5f3ee",
    roughness: 0.75,
    sheen: 0.25,
    sheenColor: new THREE.Color("#ffffff"),
    side: THREE.DoubleSide
  });

  const casualBottom = new THREE.MeshPhysicalMaterial({
    map: denimMap,
    color: "#546e8c",
    roughness: 0.68,
    side: THREE.DoubleSide
  });

  // D. Dress: Burgundy Silk Satin Mini Cowl Dress
  const dress = new THREE.MeshPhysicalMaterial({
    color: "#721a28",
    roughness: 0.3,
    metalness: 0.05,
    sheen: 0.75,
    sheenRoughness: 0.25,
    sheenColor: new THREE.Color("#c8465a"),
    clearcoat: 0.35,
    clearcoatRoughness: 0.25,
    side: THREE.DoubleSide
  });

  // E. Robe: Sheer Champagne Lace Wrap Robe
  const robe = new THREE.MeshPhysicalMaterial({
    color: "#d8c8b6",
    roughness: 0.38,
    sheen: 0.8,
    sheenColor: new THREE.Color("#fbf6ee"),
    transmission: 0.35,
    transparent: true,
    opacity: 0.88,
    side: THREE.DoubleSide
  });

  materialCache = {
    skin,
    face,
    eyeSclera,
    eyeIris,
    eyeCornea,
    hair,
    nail,
    neutralUnderwear,
    lingerie,
    casualTop,
    casualBottom,
    dress,
    robe
  };

  return materialCache;
}

/**
 * Applies or clears face overlay texture safely with resource cleanup
 */
export function applySolenneFaceMap(tex) {
  const mats = getSolenneMaterials();

  if (previousFaceTexture && previousFaceTexture !== tex) {
    previousFaceTexture.dispose();
  }

  if (mats.face.userData.baseMap == null) {
    mats.face.userData.baseMap = mats.face.map;
  }

  mats.face.map = tex || mats.face.userData.baseMap;
  mats.face.needsUpdate = true;
  previousFaceTexture = tex;
}
