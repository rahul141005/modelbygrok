import * as THREE from "three";

function luma(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export async function inspectAdultFace(file) {
  if (!file || !file.type.startsWith("image/")) {
    return { ok: false, reason: "Upload a still image (jpg/png/webp)." };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, reason: "Image must be under 8MB." };
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode"));
      el.src = url;
    });

    if (img.width < 160 || img.height < 160) {
      return { ok: false, reason: "Face image is too small." };
    }

    const c = document.createElement("canvas");
    const w = 64;
    const h = 64;
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;

    let skin = 0;
    let bright = 0;
    let dark = 0;
    const n = w * h;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const y = luma(r, g, b);
      if (y > 230) bright++;
      if (y < 18) dark++;
      const rg = r - g;
      const rb = r - b;
      if (r > 60 && g > 30 && b > 20 && rg > 8 && rb > 8 && r > b) skin++;
    }

    if (skin / n < 0.08) {
      return { ok: false, reason: "No clear adult face detected. Use a well-lit frontal portrait." };
    }
    if (bright / n > 0.72 || dark / n > 0.72) {
      return { ok: false, reason: "Image contrast is not a usable portrait." };
    }

    const tex = new THREE.Texture(img);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    tex.anisotropy = 8;
    return { ok: true, texture: tex };
  } catch {
    return { ok: false, reason: "Could not read that image." };
  } finally {
    URL.revokeObjectURL(url);
  }
}
