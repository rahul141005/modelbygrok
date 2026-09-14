import * as THREE from "three";

/**
 * Anatomical head geometry for Solenne.
 * Directly based on the FACE (FRONT), SIDE, and TOPOLOGY panels in reference.png:
 * - Realistic cranial volume (parietal, occipital, temporal contours)
 * - Defined forehead and supraorbital brow ridge
 * - True recessed orbital eye sockets
 * - Zygomatic cheekbone definition
 * - Anatomical jawline and chin
 * - Integrated ear forms
 */

export function createAnatomicalHead(radial = 64, stacks = 48, faceMorphs = {}) {
  const fw = faceMorphs.faceWidth || 0;
  const jw = faceMorphs.jawWidth || 0;
  const cs = faceMorphs.chinSize || 0;
  const cp = faceMorphs.chinProj || 0;
  const es = faceMorphs.eyeSpacing || 0;
  const cf = faceMorphs.cheekFullness || 0;

  // Start from high-density sphere base with radius ≈ 0.112m
  const geo = new THREE.SphereGeometry(0.112, radial, stacks);
  const pos = geo.attributes.position;
  const uvs = geo.attributes.uv;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Normalize coordinates relative to skull center
    // Skull height elongation (cranium is taller than wide, ratio ~ 1.25)
    y *= 1.18;
    z *= 1.05;

    // 1. Occipital bone and Cranial vault (posterior and superior)
    if (z < 0) {
      // Natural cranial curve back
      z *= 1.08;
      if (y > 0.02) {
        // Broad parietal crest
        x *= 1.04;
      } else {
        // Neck insertion taper
        x *= 0.88;
        z *= 0.92;
      }
    }

    // 2. Forehead and Temples (y > 0.03, z > 0)
    if (y > 0.03 && z > 0) {
      // Temple flattening
      if (Math.abs(x) > 0.05) {
        x *= 0.94;
      }
      // Brow ridge prominence at y ≈ 0.025 to 0.045
      if (y < 0.05 && Math.abs(x) < 0.065) {
        z += 0.007 * (1 - Math.abs(x) / 0.065);
      }
    }

    // 3. True Recessed Orbital Sockets (y ≈ 0.005 to 0.035, |x| ≈ 0.022 to 0.055, z > 0.05)
    // es (eyeSpacing) adjusts socket center outwards/inwards
    const eyeOffset = 0.036 + es * 0.008;
    if (z > 0.04 && y > -0.01 && y < 0.038) {
      const eyeCenterDistL = Math.hypot(x + eyeOffset, y - 0.016);
      const eyeCenterDistR = Math.hypot(x - eyeOffset, y - 0.016);
      const eyeDist = Math.min(eyeCenterDistL, eyeCenterDistR);
      if (eyeDist < 0.024) {
        // Recess socket into skull
        const depth = (0.024 - eyeDist) / 0.024;
        z -= depth * 0.016;
      }
    }

    // 4. High Zygomatic Cheekbones (y ≈ -0.01 to 0.015, |x| ≈ 0.045 to 0.075, z > 0.03)
    // cf (cheekFullness) modulates cheekbone volume
    if (z > 0.02 && y > -0.02 && y < 0.02) {
      const cheekFactor = Math.sin(Math.PI * Math.min(1, Math.max(0, (Math.abs(x) - 0.035) / 0.045)));
      const cheekScale = 0.006 + cf * 0.008;
      x += Math.sign(x) * cheekFactor * cheekScale * (1 + fw * 0.1);
      z += cheekFactor * (0.005 + cf * 0.006);
    }

    // Overall face width modulation
    if (y < 0.04 && y > -0.08) {
      x *= (1 + fw * 0.08);
    }

    // 5. Mandible (Jawline) and Chin (y < -0.01)
    if (y < -0.01) {
      const jawT = (-y - 0.01) / 0.12; // 0 at mouth, 1 at bottom of chin
      // Jaw taper toward chin (jw modifies jaw width)
      x *= Math.max(0.45, (1 - jawT * 0.42) * (1 + jw * 0.12));

      // Mental protuberance (feminine rounded chin projection at front)
      // cs: chin size (vertical), cp: chin projection (anterior Z)
      if (z > 0.02 && y < -0.065) {
        z += (0.010 + cp * 0.008) * (1 - Math.abs(x) / (0.03 + cs * 0.006));
      }
      // Submental jawline sweep back to neck
      if (z < 0.02 && y < -0.07) {
        y += 0.015 + cs * 0.004;
      }
    }

    // 6. Natural Ear Form at Sides (|x| > 0.085, y ≈ -0.01 to 0.03, z ≈ -0.02 to 0.01)
    if (Math.abs(x) > 0.082 && y > -0.025 && y < 0.035 && z > -0.035 && z < 0.015) {
      const earT = (0.035 - y) / 0.06;
      x += Math.sign(x) * (0.008 + Math.sin(earT * Math.PI) * 0.007);
    }

    pos.setXYZ(i, x, y, z);
  }

  // Optimize spherical UV coordinates so facial texture maps centered on front (+Z)
  for (let i = 0; i < uvs.count; i++) {
    let u = uvs.getX(i);
    let v = uvs.getY(i);
    // Align UV seam to back of head
    u = (u + 0.5) % 1.0;
    uvs.setXY(i, u, v);
  }

  geo.computeVertexNormals();

  const vertexCount = pos.count;
  geo.setAttribute("bustDelta", new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3));
  geo.setAttribute("hipDelta", new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3));
  geo.userData.base = pos.array.slice();

  return geo;
}
