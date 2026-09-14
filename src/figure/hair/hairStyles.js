import * as THREE from "three";

/**
 * Hair Style Geometry Generators for Solenne
 * Supports 6 distinct realistic hairstyles:
 * 1. waves: Canonical Solenne reference (center part, curtain bangs, cascading waves)
 * 2. straight: Long sleek editorial straight hair
 * 3. curls: Volumetric spiral bouncy waves
 * 4. halfUp: Crown pulled back with lower flowing waves
 * 5. ponytail: High sleek crown ponytail with flowing plume
 * 6. bun: Elegant low chignon with soft wisps
 */

// Helper to generate curved ribbon lock geometry with natural wave and thickness
export function createHairRibbon(points, width = 0.024, taper = 0.4, waveFreq = 2.5, waveAmp = 0.015) {
  const curve = new THREE.CatmullRomCurve3(points);
  const segments = 28;
  const radialSegments = 4;
  const positions = [];
  const uvs = [];
  const indices = [];

  const frames = curve.computeFrenetFrames(segments, false);

  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const pt = curve.getPointAt(u);
    const normal = frames.normals[i];
    const binormal = frames.binormals[i];

    const currentW = width * (1 - (1 - taper) * u);
    const wave = Math.sin(u * Math.PI * waveFreq) * waveAmp;

    for (let j = 0; j <= radialSegments; j++) {
      const v = j / radialSegments;
      const angle = v * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const ox = (binormal.x * cosA * currentW + normal.x * sinA * (currentW * 0.25)) + normal.x * wave;
      const oy = (binormal.y * cosA * currentW + normal.y * sinA * (currentW * 0.25)) + normal.y * wave;
      const oz = (binormal.z * cosA * currentW + normal.z * sinA * (currentW * 0.25)) + normal.z * wave;

      positions.push(pt.x + ox, pt.y + oy, pt.z + oz);
      uvs.push(u, v);
    }
  }

  const cols = radialSegments + 1;
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < radialSegments; j++) {
      const a = i * cols + j;
      const b = a + cols;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * 1. Canonical Solenne Waves
 */
export function getReferenceWaves() {
  return [
    // Front Curtain Bangs
    createHairRibbon([
      new THREE.Vector3(-0.012, 0.095, 0.075),
      new THREE.Vector3(-0.045, 0.065, 0.088),
      new THREE.Vector3(-0.068, 0.020, 0.078),
      new THREE.Vector3(-0.072, -0.045, 0.062),
      new THREE.Vector3(-0.065, -0.110, 0.045)
    ], 0.022, 0.35, 1.8, 0.008),
    createHairRibbon([
      new THREE.Vector3(0.012, 0.095, 0.075),
      new THREE.Vector3(0.045, 0.065, 0.088),
      new THREE.Vector3(0.068, 0.020, 0.078),
      new THREE.Vector3(0.072, -0.045, 0.062),
      new THREE.Vector3(0.065, -0.110, 0.045)
    ], 0.022, 0.35, 1.8, 0.008),

    // Shoulder Waves
    createHairRibbon([
      new THREE.Vector3(-0.055, 0.080, 0.035),
      new THREE.Vector3(-0.085, 0.010, 0.030),
      new THREE.Vector3(-0.095, -0.090, 0.045),
      new THREE.Vector3(-0.088, -0.180, 0.065),
      new THREE.Vector3(-0.075, -0.280, 0.055)
    ], 0.032, 0.45, 2.2, 0.014),
    createHairRibbon([
      new THREE.Vector3(0.055, 0.080, 0.035),
      new THREE.Vector3(0.085, 0.010, 0.030),
      new THREE.Vector3(0.095, -0.090, 0.045),
      new THREE.Vector3(0.088, -0.180, 0.065),
      new THREE.Vector3(0.075, -0.280, 0.055)
    ], 0.032, 0.45, 2.2, 0.014),

    // Back Tiers
    createHairRibbon([
      new THREE.Vector3(0.0, 0.095, -0.045),
      new THREE.Vector3(0.0, 0.035, -0.095),
      new THREE.Vector3(0.0, -0.080, -0.115),
      new THREE.Vector3(0.0, -0.200, -0.110),
      new THREE.Vector3(0.0, -0.320, -0.095)
    ], 0.048, 0.5, 2.5, 0.018),
    createHairRibbon([
      new THREE.Vector3(-0.045, 0.085, -0.040),
      new THREE.Vector3(-0.065, 0.015, -0.085),
      new THREE.Vector3(-0.068, -0.100, -0.105),
      new THREE.Vector3(-0.058, -0.220, -0.098),
      new THREE.Vector3(-0.042, -0.310, -0.085)
    ], 0.038, 0.4, 2.4, 0.015),
    createHairRibbon([
      new THREE.Vector3(0.045, 0.085, -0.040),
      new THREE.Vector3(0.065, 0.015, -0.085),
      new THREE.Vector3(0.068, -0.100, -0.105),
      new THREE.Vector3(0.058, -0.220, -0.098),
      new THREE.Vector3(0.042, -0.310, -0.085)
    ], 0.038, 0.4, 2.4, 0.015)
  ];
}

/**
 * 2. Sleek Straight
 */
export function getStraightHair() {
  return [
    createHairRibbon([
      new THREE.Vector3(-0.02, 0.09, 0.07),
      new THREE.Vector3(-0.06, 0.02, 0.06),
      new THREE.Vector3(-0.07, -0.15, 0.04),
      new THREE.Vector3(-0.065, -0.35, 0.02)
    ], 0.028, 0.6, 0.5, 0.003),
    createHairRibbon([
      new THREE.Vector3(0.02, 0.09, 0.07),
      new THREE.Vector3(0.06, 0.02, 0.06),
      new THREE.Vector3(0.07, -0.15, 0.04),
      new THREE.Vector3(0.065, -0.35, 0.02)
    ], 0.028, 0.6, 0.5, 0.003),
    createHairRibbon([
      new THREE.Vector3(0.0, 0.09, -0.04),
      new THREE.Vector3(0.0, 0.01, -0.10),
      new THREE.Vector3(0.0, -0.18, -0.11),
      new THREE.Vector3(0.0, -0.38, -0.10)
    ], 0.065, 0.7, 0.4, 0.004)
  ];
}

/**
 * 3. Volumetric Curls
 */
export function getCurlsHair() {
  return [
    createHairRibbon([
      new THREE.Vector3(-0.03, 0.09, 0.06),
      new THREE.Vector3(-0.08, 0.01, 0.06),
      new THREE.Vector3(-0.09, -0.12, 0.06),
      new THREE.Vector3(-0.08, -0.26, 0.05)
    ], 0.036, 0.4, 5.0, 0.022),
    createHairRibbon([
      new THREE.Vector3(0.03, 0.09, 0.06),
      new THREE.Vector3(0.08, 0.01, 0.06),
      new THREE.Vector3(0.09, -0.12, 0.06),
      new THREE.Vector3(0.08, -0.26, 0.05)
    ], 0.036, 0.4, 5.0, 0.022),
    createHairRibbon([
      new THREE.Vector3(0.0, 0.09, -0.04),
      new THREE.Vector3(0.0, 0.01, -0.11),
      new THREE.Vector3(0.0, -0.14, -0.12),
      new THREE.Vector3(0.0, -0.28, -0.10)
    ], 0.055, 0.5, 4.5, 0.024)
  ];
}

/**
 * 4. Half-Up Half-Down
 */
export function getHalfUpHair() {
  return [
    createHairRibbon([
      new THREE.Vector3(-0.02, 0.09, 0.07),
      new THREE.Vector3(-0.05, 0.04, 0.07),
      new THREE.Vector3(-0.06, -0.05, 0.05)
    ], 0.02, 0.5, 1.5, 0.006),
    createHairRibbon([
      new THREE.Vector3(0.02, 0.09, 0.07),
      new THREE.Vector3(0.05, 0.04, 0.07),
      new THREE.Vector3(0.06, -0.05, 0.05)
    ], 0.02, 0.5, 1.5, 0.006),
    // Pinched upper knot
    createHairRibbon([
      new THREE.Vector3(0.0, 0.08, -0.06),
      new THREE.Vector3(0.0, 0.05, -0.09),
      new THREE.Vector3(0.0, 0.02, -0.11)
    ], 0.035, 0.8, 1.0, 0.005),
    // Cascading lower half
    createHairRibbon([
      new THREE.Vector3(0.0, 0.02, -0.11),
      new THREE.Vector3(0.0, -0.12, -0.12),
      new THREE.Vector3(0.0, -0.28, -0.10)
    ], 0.05, 0.5, 2.5, 0.016)
  ];
}

/**
 * 5. High Sleek Ponytail
 */
export function getPonytailHair() {
  return [
    // Pulled-back crown gathering
    createHairRibbon([
      new THREE.Vector3(0.0, 0.10, -0.02),
      new THREE.Vector3(0.0, 0.11, -0.06),
      new THREE.Vector3(0.0, 0.10, -0.09)
    ], 0.038, 0.6, 0.5, 0.002),
    // Flowing ponytail plume
    createHairRibbon([
      new THREE.Vector3(0.0, 0.10, -0.09),
      new THREE.Vector3(0.0, 0.04, -0.14),
      new THREE.Vector3(0.0, -0.08, -0.16),
      new THREE.Vector3(0.0, -0.22, -0.14),
      new THREE.Vector3(0.0, -0.34, -0.12)
    ], 0.04, 0.35, 2.0, 0.015)
  ];
}

/**
 * 6. Chic Low Bun
 */
export function getBunHair() {
  return [
    // Soft wisps at temples
    createHairRibbon([
      new THREE.Vector3(-0.03, 0.08, 0.06),
      new THREE.Vector3(-0.05, 0.02, 0.06),
      new THREE.Vector3(-0.055, -0.04, 0.04)
    ], 0.012, 0.3, 1.5, 0.004),
    createHairRibbon([
      new THREE.Vector3(0.03, 0.08, 0.06),
      new THREE.Vector3(0.05, 0.02, 0.06),
      new THREE.Vector3(0.055, -0.04, 0.04)
    ], 0.012, 0.3, 1.5, 0.004),
    // Nape chignon knot
    createHairRibbon([
      new THREE.Vector3(0.0, 0.02, -0.09),
      new THREE.Vector3(0.0, -0.02, -0.12),
      new THREE.Vector3(0.0, -0.05, -0.11),
      new THREE.Vector3(0.0, -0.03, -0.08)
    ], 0.055, 0.9, 1.0, 0.008)
  ];
}
