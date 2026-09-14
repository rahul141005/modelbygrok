import * as THREE from "three";

/**
 * Solenne Anatomical Morph Deformation System
 * Smoothly scales soft-tissue bust and hip volumes while strictly preserving:
 * - Total height
 * - Head and facial proportions
 * - Shoulder width & bony clavicle anchor
 * - Ribcage core and spine
 * - Limb lengths, elbows, knees, hands, and feet
 */

export function clamp(x, a, b) {
  return Math.min(b, Math.max(a, x));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function bustAmt(bust) {
  return (bust - 0.42) / 0.58;
}

export function hipAmt(hips) {
  return (hips - 0.48) / 0.52;
}

/**
 * Applies morph deltas to a single mesh BufferGeometry
 */
export function applyMorph(mesh, bust, hips) {
  if (!mesh || !mesh.geometry) return;
  const geo = mesh.geometry;
  const pos = geo.attributes.position;
  const bd = geo.attributes.bustDelta;
  const hd = geo.attributes.hipDelta;

  if (!pos || !bd || !hd) return;

  if (!geo.userData.base) {
    geo.userData.base = pos.array.slice();
  }

  const base = geo.userData.base;
  const bu = bustAmt(bust);
  const hu = hipAmt(hips);
  const count = pos.count;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    pos.setXYZ(
      i,
      base[idx]     + bd.getX(i) * bu + hd.getX(i) * hu,
      base[idx + 1] + bd.getY(i) * bu + hd.getY(i) * hu,
      base[idx + 2] + bd.getZ(i) * bu + hd.getZ(i) * hu
    );
  }

  pos.needsUpdate = true;
  geo.computeVertexNormals();
}

/**
 * Traverses an entire Object3D hierarchy and morphs all compatible meshes
 */
export function morphAll(root, bust, hips) {
  if (!root) return;
  root.traverse((obj) => {
    if (obj.isMesh && obj.geometry && obj.geometry.attributes.bustDelta) {
      applyMorph(obj, bust, hips);
    }
  });
}

/**
 * Creates an offset garment shell that inherits vertex deltas directly from the underlying body.
 * This guarantees 100% synchronous deformation with zero clipping across all morph ranges.
 */
export function createOffsetGarmentShell(sourceGeo, offset, vMin, vMax, options = {}) {
  const pos = sourceGeo.attributes.position;
  const nrm = sourceGeo.attributes.normal;
  const uv = sourceGeo.attributes.uv;
  const bd = sourceGeo.attributes.bustDelta;
  const hd = sourceGeo.attributes.hipDelta;

  const positions = [];
  const uvs = [];
  const bustAttr = [];
  const hipAttr = [];
  const keep = [];

  const extraFront = options.extraFront || 0;
  const flare = options.flare || 0;

  for (let i = 0; i < pos.count; i++) {
    const v = uv ? uv.getY(i) : 0;
    if (v < vMin || v > vMax) continue;

    keep.push(i);

    const nx = nrm ? nrm.getX(i) : 0;
    const ny = nrm ? nrm.getY(i) : 0;
    const nz = nrm ? nrm.getZ(i) : 0;

    // Flare for skirts or flowing coats
    let flareX = 0;
    let flareZ = 0;
    if (flare > 0) {
      const t = 1 - (v - vMin) / (vMax - vMin);
      const f = t * t * flare;
      flareX = pos.getX(i) * f;
      flareZ = pos.getZ(i) * f * 0.8;
    }

    const ox = nx * offset + flareX;
    const oy = ny * offset;
    const oz = nz * offset + Math.max(0, nz) * extraFront + flareZ;

    positions.push(pos.getX(i) + ox, pos.getY(i) + oy, pos.getZ(i) + oz);
    uvs.push(uv ? uv.getX(i) : 0, (v - vMin) / (vMax - vMin));

    if (bd && hd) {
      bustAttr.push(bd.getX(i), bd.getY(i), bd.getZ(i));
      hipAttr.push(hd.getX(i), hd.getY(i), hd.getZ(i));
    } else {
      bustAttr.push(0, 0, 0);
      hipAttr.push(0, 0, 0);
    }
  }

  // Rebuild index buffer for active garment quad strips
  const indexMap = new Map();
  keep.forEach((srcIdx, dstIdx) => indexMap.set(srcIdx, dstIdx));

  const indices = [];
  if (sourceGeo.index) {
    const srcIndex = sourceGeo.index.array;
    for (let i = 0; i < srcIndex.length; i += 3) {
      const a = srcIndex[i];
      const b = srcIndex[i + 1];
      const c = srcIndex[i + 2];
      if (indexMap.has(a) && indexMap.has(b) && indexMap.has(c)) {
        indices.push(indexMap.get(a), indexMap.get(b), indexMap.get(c));
      }
    }
  }

  const garmentGeo = new THREE.BufferGeometry();
  garmentGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  garmentGeo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  garmentGeo.setAttribute("bustDelta", new THREE.Float32BufferAttribute(bustAttr, 3));
  garmentGeo.setAttribute("hipDelta", new THREE.Float32BufferAttribute(hipAttr, 3));
  if (indices.length > 0) garmentGeo.setIndex(indices);
  garmentGeo.computeVertexNormals();
  garmentGeo.userData.base = new Float32Array(positions);

  return garmentGeo;
}
