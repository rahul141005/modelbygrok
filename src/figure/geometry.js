import * as THREE from "three";

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(x, a, b) {
  return Math.min(b, Math.max(a, x));
}

export function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

export function bustAmt(bust) {
  return (bust - 0.42) / 0.58;
}

export function hipAmt(hips) {
  return (hips - 0.48) / 0.52;
}

export function bodyRadii(v, bust, hips) {
  const bu = bust;
  const hi = hips;
  let rx = 0.08;
  let rz = 0.07;

  if (v < 0.03) {
    rx = lerp(0.055, 0.04, v / 0.03);
    rz = lerp(0.1, 0.055, v / 0.03);
  } else if (v < 0.08) {
    const t = (v - 0.03) / 0.05;
    rx = lerp(0.04, 0.038, t);
    rz = lerp(0.055, 0.042, t);
  } else if (v < 0.24) {
    const t = (v - 0.08) / 0.16;
    rx = lerp(0.038, 0.055, t);
    rz = lerp(0.042, 0.058, t);
  } else if (v < 0.28) {
    const t = (v - 0.24) / 0.04;
    rx = lerp(0.055, 0.052, t);
    rz = lerp(0.058, 0.055, t);
  } else if (v < 0.48) {
    const t = (v - 0.28) / 0.2;
    rx = lerp(0.052, 0.09 + hi * 0.04, t);
    rz = lerp(0.055, 0.085 + hi * 0.02, t);
  } else if (v < 0.56) {
    const t = (v - 0.48) / 0.08;
    rx = lerp(0.09 + hi * 0.04, 0.135 + hi * 0.07, t);
    rz = lerp(0.085 + hi * 0.02, 0.11 + hi * 0.035, t);
  } else if (v < 0.66) {
    const t = (v - 0.56) / 0.1;
    rx = lerp(0.135 + hi * 0.07, 0.1, t);
    rz = lerp(0.11 + hi * 0.035, 0.085, t);
  } else if (v < 0.74) {
    const t = (v - 0.66) / 0.08;
    rx = lerp(0.1, 0.118 + bu * 0.055, t);
    rz = lerp(0.085, 0.12 + bu * 0.05, t);
  } else if (v < 0.82) {
    const t = (v - 0.74) / 0.08;
    rx = lerp(0.118 + bu * 0.055, 0.16, t);
    rz = lerp(0.12 + bu * 0.05, 0.09, t);
  } else if (v < 0.9) {
    const t = (v - 0.82) / 0.08;
    rx = lerp(0.16, 0.055, t);
    rz = lerp(0.09, 0.05, t);
  } else {
    const t = (v - 0.9) / 0.1;
    rx = lerp(0.055, 0.048, t);
    rz = lerp(0.05, 0.048, t);
  }
  return { rx, rz };
}

export function createBodyGeometry(height = 1.58, radial = 48, stacks = 72) {
  return createMorphedTube(height, radial, stacks, (v, bust, hips) => bodyRadii(v, bust, hips), {
    frontBias: (v, bust) => smoothstep(0.68, 0.78, v) * (1 - smoothstep(0.78, 0.84, v)) * (0.02 + bust * 0.05),
    sideBias: (v, hips) => smoothstep(0.5, 0.56, v) * (1 - smoothstep(0.56, 0.64, v)) * (hips * 0.03)
  });
}

function createMorphedTube(height, radial, stacks, getR, bias = {}) {
  const positions = [];
  const uvs = [];
  const bustAttr = [];
  const hipAttr = [];

  const sample = (v, bust, hips, u) => {
    const { rx, rz } = getR(v, bust, hips);
    const a = u * Math.PI * 2 - Math.PI / 2;
    const front = Math.max(0, Math.sin(a));
    const side = Math.abs(Math.cos(a));
    const fb = bias.frontBias ? bias.frontBias(v, bust) * front : 0;
    const sb = bias.sideBias ? bias.sideBias(v, hips) * side : 0;
    const x = Math.cos(a) * (rx + sb);
    const z = Math.sin(a) * (rz + fb);
    return [x, v * height, z];
  };

  for (let i = 0; i <= stacks; i++) {
    const v = i / stacks;
    for (let j = 0; j <= radial; j++) {
      const u = j / radial;
      const p = sample(v, 0.42, 0.48, u);
      const pb = sample(v, 1, 0.48, u);
      const ph = sample(v, 0.42, 1, u);
      positions.push(p[0], p[1], p[2]);
      uvs.push(u, v);
      bustAttr.push(pb[0] - p[0], pb[1] - p[1], pb[2] - p[2]);
      hipAttr.push(ph[0] - p[0], ph[1] - p[1], ph[2] - p[2]);
    }
  }

  const indices = [];
  const cols = radial + 1;
  for (let i = 0; i < stacks; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * cols + j;
      const b = a + cols;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute("bustDelta", new THREE.Float32BufferAttribute(bustAttr, 3));
  geo.setAttribute("hipDelta", new THREE.Float32BufferAttribute(hipAttr, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.userData.base = new Float32Array(positions);
  return geo;
}

export function createLimb(radiusTop, radiusBot, height, radial = 18, stacks = 16, hipInfluence = 0, bustInfluence = 0) {
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBot, height, radial, stacks, true);
  const n = geo.attributes.position.count;
  const bust = new Float32Array(n * 3);
  const hip = new Float32Array(n * 3);
  const pos = geo.attributes.position;
  for (let i = 0; i < n; i++) {
    const y = pos.getY(i);
    const t = (y + height / 2) / height;
    const hs = hipInfluence * (1 - t);
    const bs = bustInfluence * t;
    hip[i * 3] = pos.getX(i) * hs;
    hip[i * 3 + 2] = pos.getZ(i) * hs;
    bust[i * 3] = pos.getX(i) * bs * 0.15;
    bust[i * 3 + 2] = pos.getZ(i) * bs * 0.1;
  }
  geo.setAttribute("bustDelta", new THREE.BufferAttribute(bust, 3));
  geo.setAttribute("hipDelta", new THREE.BufferAttribute(hip, 3));
  geo.userData.base = geo.attributes.position.array.slice();
  geo.computeVertexNormals();
  return geo;
}

export function createHead() {
  const geo = new THREE.SphereGeometry(0.108, 48, 36);
  const n = geo.attributes.position.count;
  const pos = geo.attributes.position;
  for (let i = 0; i < n; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);
    y *= 1.14;
    z *= 0.9;
    if (y < -0.02) x *= 0.9;
    if (z > 0.02) z += 0.014;
    if (y > 0.04 && Math.abs(x) > 0.04) {
      x *= 1.04;
      z *= 0.98;
    }
    pos.setXYZ(i, x, y, z);
  }
  geo.setAttribute("bustDelta", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute("hipDelta", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.userData.base = geo.attributes.position.array.slice();
  geo.computeVertexNormals();
  return geo;
}

export function createOffsetShell(sourceGeo, offset, vMin, vMax, extraFront = 0) {
  const pos = sourceGeo.attributes.position;
  const nrm = sourceGeo.attributes.normal;
  const uv = sourceGeo.attributes.uv;
  const positions = [];
  const uvs = [];
  const bustAttr = [];
  const hipAttr = [];
  const keep = [];

  for (let i = 0; i < pos.count; i++) {
    const v = uv.getY(i);
    if (v < vMin || v > vMax) continue;
    keep.push(i);
    const ox = nrm.getX(i) * offset;
    const oy = nrm.getY(i) * offset;
    const oz = nrm.getZ(i) * offset + Math.max(0, nrm.getZ(i)) * extraFront;
    positions.push(pos.getX(i) + ox, pos.getY(i) + oy, pos.getZ(i) + oz);
    uvs.push(uv.getX(i), (v - vMin) / (vMax - vMin));
    const bd = sourceGeo.attributes.bustDelta;
    const hd = sourceGeo.attributes.hipDelta;
    bustAttr.push(bd.getX(i), bd.getY(i), bd.getZ(i));
    hipAttr.push(hd.getX(i), hd.getY(i), hd.getZ(i));
  }

  const indexMap = new Map();
  keep.forEach((src, dst) => indexMap.set(src, dst));
  const srcIndex = sourceGeo.index.array;
  const indices = [];
  for (let i = 0; i < srcIndex.length; i += 3) {
    const a = srcIndex[i];
    const b = srcIndex[i + 1];
    const c = srcIndex[i + 2];
    if (indexMap.has(a) && indexMap.has(b) && indexMap.has(c)) {
      indices.push(indexMap.get(a), indexMap.get(b), indexMap.get(c));
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute("bustDelta", new THREE.Float32BufferAttribute(bustAttr, 3));
  geo.setAttribute("hipDelta", new THREE.Float32BufferAttribute(hipAttr, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  geo.userData.base = new Float32Array(positions);
  return geo;
}

export function createSkirtShell(sourceGeo, offset, vMin, vMax, flare = 0.08) {
  const geo = createOffsetShell(sourceGeo, offset, vMin, vMax, 0.012);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const hd = geo.attributes.hipDelta;
  const base = geo.userData.base;
  for (let i = 0; i < pos.count; i++) {
    const t = 1 - uv.getY(i);
    const f = t * t * flare;
    const nx = pos.getX(i) * (1 + f * 2.2);
    const nz = pos.getZ(i) * (1 + f * 1.4) + t * 0.02;
    pos.setX(i, nx);
    pos.setZ(i, nz);
    base[i * 3] = nx;
    base[i * 3 + 2] = nz;
    hd.setX(i, hd.getX(i) * (1 + f));
    hd.setZ(i, hd.getZ(i) * (1 + f * 0.6));
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

export function applyMorph(mesh, bust, hips) {
  const pos = mesh.geometry.attributes.position;
  const bd = mesh.geometry.attributes.bustDelta;
  const hd = mesh.geometry.attributes.hipDelta;
  if (!bd || !hd) return;
  if (!mesh.geometry.userData.base) {
    mesh.geometry.userData.base = pos.array.slice();
  }
  const b = mesh.geometry.userData.base;
  const bu = bustAmt(bust);
  const hu = hipAmt(hips);
  for (let i = 0; i < pos.count; i++) {
    pos.setXYZ(
      i,
      b[i * 3] + bd.getX(i) * bu + hd.getX(i) * hu,
      b[i * 3 + 1] + bd.getY(i) * bu + hd.getY(i) * hu,
      b[i * 3 + 2] + bd.getZ(i) * bu + hd.getZ(i) * hu
    );
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
}

export function morphAll(root, bust, hips) {
  root.traverse((obj) => {
    if (obj.isMesh && obj.geometry?.attributes?.bustDelta) applyMorph(obj, bust, hips);
  });
}
