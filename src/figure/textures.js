import * as THREE from "three";

function noise(ctx, w, h, warmth = 6) {
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = Math.random() * 255;
    d[i] = Math.min(255, Math.max(0, d[i] + (n - 128) * 0.07 + warmth));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + (n - 128) * 0.05));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + (n - 128) * 0.04 - 3));
    if (Math.random() < 0.01) {
      d[i] = Math.min(255, d[i] + 16);
      d[i + 1] = Math.min(255, d[i + 1] + 5);
    }
  }
  ctx.putImageData(img, 0, 0);
}

export function makeBodyAlbedo() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 2048;
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, 0, 2048);
  g.addColorStop(0, "#d8b49c");
  g.addColorStop(0.22, "#c9a48c");
  g.addColorStop(0.48, "#c19680");
  g.addColorStop(0.64, "#c49a84");
  g.addColorStop(0.82, "#b88872");
  g.addColorStop(1, "#c9a790");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 1024, 2048);
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = "#e8b09a";
  ctx.beginPath();
  ctx.ellipse(512, 560, 300, 170, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a86a62";
  ctx.globalAlpha = 0.12;
  ctx.beginPath();
  ctx.ellipse(512, 980, 230, 95, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  noise(ctx, 1024, 2048, 5);
  return c;
}

export function makeSkinNormal() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#8080ff";
  ctx.fillRect(0, 0, 512, 512);
  const img = ctx.getImageData(0, 0, 512, 512);
  const d = img.data;
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const i = (y * 512 + x) * 4;
      const n = (Math.sin(x * 1.7) + Math.cos(y * 1.9) + Math.random()) * 9;
      d[i] = 128 + n;
      d[i + 1] = 128 + n * 0.65;
      d[i + 2] = 255;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

export function makeFaceAlbedo() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#c9a48c";
  ctx.fillRect(0, 0, 1024, 1024);

  const cheek = ctx.createRadialGradient(330, 560, 8, 330, 560, 190);
  cheek.addColorStop(0, "rgba(196,90,90,0.3)");
  cheek.addColorStop(1, "rgba(196,90,90,0)");
  ctx.fillStyle = cheek;
  ctx.fillRect(0, 0, 1024, 1024);
  const cheek2 = ctx.createRadialGradient(694, 560, 8, 694, 560, 190);
  cheek2.addColorStop(0, "rgba(196,90,90,0.3)");
  cheek2.addColorStop(1, "rgba(196,90,90,0)");
  ctx.fillStyle = cheek2;
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.fillStyle = "#3a2a22";
  ctx.beginPath();
  ctx.ellipse(360, 428, 78, 16, -0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(664, 428, 78, 16, 0.16, 0, Math.PI * 2);
  ctx.fill();

  function eye(x, y) {
    ctx.fillStyle = "#f3ebe4";
    ctx.beginPath();
    ctx.ellipse(x, y, 50, 21, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6b7344";
    ctx.beginPath();
    ctx.arc(x, y, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a140e";
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x - 5, y - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1a120e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(x, y, 50, 21, 0, Math.PI, Math.PI * 2);
    ctx.stroke();
  }
  eye(360, 500);
  eye(664, 500);

  ctx.fillStyle = "rgba(90,50,40,0.22)";
  ctx.beginPath();
  ctx.moveTo(512, 500);
  ctx.lineTo(472, 640);
  ctx.lineTo(552, 640);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(90,60,50,0.35)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(512, 520);
  ctx.lineTo(512, 648);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(512, 654, 16, 7, 0, 0, Math.PI);
  ctx.stroke();

  ctx.fillStyle = "#b56b6a";
  ctx.beginPath();
  ctx.ellipse(512, 758, 56, 21, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#9a4e52";
  ctx.beginPath();
  ctx.ellipse(512, 766, 50, 9, 0, 0, Math.PI);
  ctx.fill();

  noise(ctx, 1024, 1024, 7);
  return c;
}

export function makeFabric(base, weave = 0.08) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext("2d");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);
  const img = ctx.getImageData(0, 0, 512, 512);
  const d = img.data;
  for (let y = 0; y < 512; y++) {
    for (let x = 0; x < 512; x++) {
      const i = (y * 512 + x) * 4;
      const w = ((x + y) % 4 === 0 ? 18 : 0) + ((x * 3 + y) % 7 === 0 ? 8 : 0);
      const n = (Math.random() - 0.5) * 22;
      d[i] = Math.min(255, Math.max(0, d[i] + w * weave + n));
      d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + w * weave + n * 0.8));
      d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + w * weave * 0.7 + n * 0.6));
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

export function toTexture(canvas, opts = {}) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  if (opts.repeat) tex.repeat.set(opts.repeat[0], opts.repeat[1]);
  tex.needsUpdate = true;
  return tex;
}
