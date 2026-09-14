import * as THREE from "three";

/**
 * Anatomical foot geometry for Solenne.
 * Directly based on the FOOT DETAIL panel in reference.png:
 * - Defined calcaneus (heel)
 * - Raised medial longitudinal arch / instep
 * - Metatarsal ball of foot
 * - Sculpted toe profile
 * - Ankle transition with medial & lateral malleoli
 */

export function createAnatomicalFoot(isLeft = true) {
  const sideSign = isLeft ? -1 : 1;

  // Longitudinal foot profile: length ≈ 0.22m, width ≈ 0.08m, height at instep ≈ 0.07m
  const footGeo = new THREE.BoxGeometry(0.076, 0.065, 0.21, 8, 8, 14);
  const pos = footGeo.attributes.position;

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i); // +Z is front (toes), -Z is back (heel)

    // Center foot on ankle insertion at z ≈ -0.02
    const zRel = (z + 0.105) / 0.21; // 0 at heel, 1 at toes

    // 1. Calcaneus (heel) rounding at back (zRel < 0.25)
    if (zRel < 0.25) {
      const ht = (0.25 - zRel) / 0.25;
      x *= (1 - ht * 0.25);
      if (y < 0) {
        y += ht * 0.008; // curve up into Achilles tendon
      }
    }

    // 2. Medial Arch (inner instep lift)
    // For left foot (sideSign = -1), inner is +X (towards midline)
    // For right foot (sideSign = 1), inner is -X (towards midline)
    const isMedial = (sideSign < 0 && x > 0) || (sideSign > 0 && x < 0);
    if (isMedial && zRel > 0.22 && zRel < 0.65 && y < 0.01) {
      const archFactor = Math.sin((zRel - 0.22) / 0.43 * Math.PI);
      y += archFactor * 0.018; // lift medial arch off floor
    }

    // 3. Forefoot & Ball of Foot (zRel ≈ 0.65 -> 0.85)
    if (zRel >= 0.65 && zRel <= 0.85) {
      x *= 1.12; // expand across metatarsals
      if (y > 0) {
        y -= (zRel - 0.65) * 0.08; // slope down to toes
      }
    }

    // 4. Toes taper and slope down to floor (zRel > 0.85)
    if (zRel > 0.85) {
      const toeT = (zRel - 0.85) / 0.15;
      y = Math.min(y, 0.014 * (1 - toeT)); // flatter on ground
      // Asymmetric toe taper (big toe longer on medial side)
      if (!isMedial) {
        z -= toeT * 0.012; // pinky toe slopes back
      }
    }

    // 5. Ankle malleoli swellings (at top, near z ≈ -0.02)
    if (y > 0.015 && z > -0.06 && z < 0.02) {
      // Lateral malleolus (outer side) is lower and slightly posterior
      // Medial malleolus (inner side) is higher and slightly anterior
      if (!isMedial) {
        x += sideSign * 0.006;
      } else {
        x += -sideSign * 0.005;
      }
    }

    pos.setXYZ(i, x, y, z);
  }

  footGeo.computeVertexNormals();

  // Create separate delicate toenails plane geometry for realistic detail
  const nailGeo = new THREE.PlaneGeometry(0.068, 0.014, 5, 2);
  nailGeo.rotateX(-Math.PI / 2);
  nailGeo.translate(0, 0.015, 0.098);

  const vertexCount = footGeo.attributes.position.count;
  footGeo.setAttribute("bustDelta", new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3));
  footGeo.setAttribute("hipDelta", new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3));
  footGeo.userData.base = footGeo.attributes.position.array.slice();

  return { footGeo, nailGeo };
}
