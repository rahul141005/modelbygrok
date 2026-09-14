import * as THREE from "three";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * High-definition anatomical torso & body geometry generator for Solenne.
 * Directly based on proportions, silhouette, and topology in reference.png:
 * - Height: 170cm
 * - Bust (base): 84cm
 * - Waist: 62cm
 * - Hips (base): 92cm
 * - Euro-Mediterranean athletic feminine silhouette
 */

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(x, a, b) {
  return Math.min(b, Math.max(a, x));
}

function smoothstep(e0, e1, x) {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
}

/**
 * Creates the high-fidelity anatomical torso geometry.
 * Extends from pelvic floor / perineum (y ≈ 0.76) through hips, waist, ribcage,
 * breasts, clavicles, shoulders, and neck base (y ≈ 1.48).
 */
export function createTorsoGeometry(radial = 64, stacks = 80) {
  const positions = [];
  const uvs = [];
  const bustAttr = [];
  const hipAttr = [];

  const yMin = 0.76;
  const yMax = 1.48;
  const totalH = yMax - yMin;

  // Function to sample anatomical cross section at vertical fraction v (0 to 1)
  // and angle theta around vertical axis.
  const samplePoint = (v, u, bustWeight = 0.42, hipWeight = 0.48) => {
    const y = yMin + v * totalH;
    const a = u * Math.PI * 2 - Math.PI / 2; // -PI/2 is +Z (front)
    const cosA = Math.cos(a);
    const sinA = Math.sin(a); // +1 at front (+Z), -1 at back (-Z)

    // Base lateral (rx) and anterior-posterior (rz) radius profile based on Solenne reference
    let rx = 0.12;
    let rz = 0.09;
    let centerZ = 0; // Natural spinal S-curvature (lordosis/kyphosis)

    if (v < 0.18) {
      // Lower pelvis / crotch / gluteal fold transition (y: 0.76 -> 0.89)
      const t = v / 0.18;
      rx = lerp(0.125, 0.178, t);
      rz = lerp(0.095, 0.128, t);
      // Gluteal fullness behind (+Z is front, -Z is back)
      centerZ = lerp(-0.012, -0.018, t);
    } else if (v < 0.36) {
      // Maximum hip crest / greater trochanter flare (y: 0.89 -> 1.02)
      // Reference: 92 cm hip circumference
      const t = (v - 0.18) / 0.18;
      rx = lerp(0.178, 0.142, t);
      rz = lerp(0.128, 0.104, t);
      centerZ = lerp(-0.018, -0.005, t); // Lumbar lordosis curve forward
    } else if (v < 0.52) {
      // Waistline / narrowest torso contour (y: 1.02 -> 1.13)
      // Reference: 62 cm waist circumference
      const t = (v - 0.36) / 0.16;
      rx = lerp(0.142, 0.138, t);
      rz = lerp(0.104, 0.096, t);
      centerZ = lerp(-0.005, 0.008, t);
    } else if (v < 0.74) {
      // Lower ribcage expanding into bust zone (y: 1.13 -> 1.29)
      // Reference: 84 cm bust circumference
      const t = (v - 0.52) / 0.22;
      rx = lerp(0.138, 0.162, t);
      rz = lerp(0.096, 0.118, t);
      centerZ = lerp(0.008, -0.006, t); // Thoracic curvature backward
    } else if (v < 0.88) {
      // Upper chest, clavicle, and shoulder span (y: 1.29 -> 1.39)
      const t = (v - 0.74) / 0.14;
      rx = lerp(0.162, 0.188, t);
      rz = lerp(0.118, 0.088, t);
      centerZ = lerp(-0.006, -0.002, t);
    } else {
      // Neck transition up to skull base (y: 1.39 -> 1.48)
      const t = (v - 0.88) / 0.12;
      rx = lerp(0.188, 0.052, t);
      rz = lerp(0.088, 0.054, t);
      centerZ = lerp(-0.002, 0.012, t);
    }

    // Anatomical Cross-Section Shaping:
    // 1. Gluteal shaping (back, lower pelvis, v: 0.05 -> 0.32)
    const isBack = Math.max(0, -sinA);
    const gluteMask = smoothstep(0.02, 0.14, v) * (1 - smoothstep(0.14, 0.35, v));
    const gluteCleft = Math.abs(cosA) * (1 - Math.abs(cosA) * 0.4);
    const gluteBulge = isBack * gluteMask * gluteCleft * 0.038;

    // 2. Hip / Pelvis morph and anatomical flare (sides, v: 0.10 -> 0.38)
    const isSide = Math.pow(Math.abs(cosA), 1.6);
    const hipMask = smoothstep(0.06, 0.20, v) * (1 - smoothstep(0.24, 0.44, v));
    const hipDeltaScale = (hipWeight - 0.48) / 0.52;
    const hipShape = isSide * hipMask * (0.022 + hipDeltaScale * 0.032);
    const hipDeltaVal = isSide * hipMask * 0.032;

    // 3. Spinal furrow down the back (v: 0.28 -> 0.88)
    const spineMask = smoothstep(0.25, 0.4, v) * (1 - smoothstep(0.85, 0.95, v));
    const spineIndent = (1 - Math.min(1, Math.abs(cosA) * 6)) * isBack * spineMask * 0.009;

    // 4. Scapulae / shoulder blades in upper back (v: 0.68 -> 0.84)
    const scapulaMask = smoothstep(0.68, 0.76, v) * (1 - smoothstep(0.80, 0.88, v));
    const scapulaSide = Math.abs(cosA) > 0.35 && Math.abs(cosA) < 0.75 ? 1 : 0;
    const scapulaBulge = isBack * scapulaMask * scapulaSide * 0.012;

    // 5. Clavicles / collarbones across upper chest (v: 0.82 -> 0.89)
    const isFront = Math.max(0, sinA);
    const clavicleMask = smoothstep(0.81, 0.85, v) * (1 - smoothstep(0.86, 0.91, v));
    const clavicleRidge = isFront * clavicleMask * Math.pow(Math.abs(cosA), 0.7) * 0.011;

    // 6. Natural Breasts (Solenne base: 84 cm, v: 0.56 -> 0.78)
    // Modeled as natural feminine contours radiating from pectoralis with gentle teardrop sag
    const breastMask = smoothstep(0.56, 0.66, v) * (1 - smoothstep(0.72, 0.82, v));
    // Bilateral separation (center cleavage at x = 0)
    const breastSideFactor = Math.sin(Math.PI * clamp((Math.abs(cosA) - 0.08) / 0.52, 0, 1));
    const bustDeltaScale = (bustWeight - 0.42) / 0.58;
    const baseBreastProjection = 0.034;
    const bustMorphProjection = bustDeltaScale * 0.042;
    const breastBulge = isFront * breastMask * Math.max(0, breastSideFactor) * (baseBreastProjection + bustMorphProjection);
    const bustDeltaVal = isFront * breastMask * Math.max(0, breastSideFactor) * 0.042;

    // 7. Abdominal curve / belly contour (v: 0.35 -> 0.55)
    const bellyMask = smoothstep(0.32, 0.42, v) * (1 - smoothstep(0.48, 0.58, v));
    const bellyBulge = isFront * (1 - Math.abs(cosA)) * bellyMask * 0.010;

    // Compute final vertex coordinate
    const finalRx = rx + hipShape;
    const finalRz = rz + breastBulge + gluteBulge + bellyBulge + clavicleRidge + scapulaBulge - spineIndent;

    const px = cosA * finalRx;
    const py = y;
    const pz = sinA * finalRz + centerZ;

    // Compute morph delta offsets in tangent space
    const dX = cosA * hipDeltaVal;
    const dZ = sinA * (bustDeltaVal + (isBack ? hipDeltaVal * 0.6 : 0));

    return { pos: [px, py, pz], bustDelta: [0, 0, bustDeltaVal * sinA], hipDelta: [dX, 0, dZ] };
  };

  for (let i = 0; i <= stacks; i++) {
    const v = i / stacks;
    for (let j = 0; j <= radial; j++) {
      const u = j / radial;
      const res = samplePoint(v, u, 0.42, 0.48);
      positions.push(res.pos[0], res.pos[1], res.pos[2]);
      uvs.push(u, v);
      bustAttr.push(res.bustDelta[0], res.bustDelta[1], res.bustDelta[2]);
      hipAttr.push(res.hipDelta[0], res.hipDelta[1], res.hipDelta[2]);
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

/**
 * Creates anatomically sculpted leg geometry (Thigh, Knee with patella, Calf with gastrocnemius, Ankle).
 * Follows the natural inward femur tilt and sculpted knee of Solenne.
 */
export function createAnatomicalLeg(isLeft = true, radial = 32, stacks = 56) {
  const positions = [];
  const uvs = [];
  const hipAttr = [];
  const bustAttr = [];

  const yTop = 0.82; // Pelvic hip joint
  const yBot = 0.08; // Above ankle joint
  const totalH = yTop - yBot;

  for (let i = 0; i <= stacks; i++) {
    const v = i / stacks; // 0 is bottom (ankle), 1 is top (hip)
    const y = yBot + v * totalH;

    // Center X/Z curve following natural leg axis (slight inward tilt and knee contour)
    const sideSign = isLeft ? -1 : 1;
    let cx = sideSign * lerp(0.076, 0.098, v);
    let cz = 0;

    // Cross-section radii
    let rx = 0.04;
    let rz = 0.04;

    if (v > 0.55) {
      // Upper thigh to groin (y: 0.48 -> 0.82)
      const t = (v - 0.55) / 0.45;
      rx = lerp(0.048, 0.082, t);
      rz = lerp(0.052, 0.088, t);
      cz = lerp(0.002, 0.008, t);
    } else if (v > 0.45) {
      // Anatomical knee zone (y: 0.41 -> 0.48, centered at y ≈ 0.45)
      const t = (v - 0.45) / 0.10;
      rx = lerp(0.042, 0.048, t);
      rz = lerp(0.046, 0.052, t);
    } else if (v > 0.18) {
      // Calf zone with gastrocnemius curve (y: 0.21 -> 0.41)
      const t = (v - 0.18) / 0.27;
      const calfPeak = Math.sin(t * Math.PI);
      rx = lerp(0.028, 0.042, t) + calfPeak * 0.009;
      rz = lerp(0.030, 0.046, t) + calfPeak * 0.016; // Posterior calf muscle volume
      cz = -calfPeak * 0.012; // Posterior shift of muscle belly
    } else {
      // Lower calf tapering down to ankle (y: 0.08 -> 0.21)
      const t = v / 0.18;
      rx = lerp(0.024, 0.028, t);
      rz = lerp(0.026, 0.030, t);
      cz = 0;
    }

    // Hip morph influence on upper thigh
    const hipWeight = smoothstep(0.65, 1.0, v);

    for (let j = 0; j <= radial; j++) {
      const u = j / radial;
      const angle = u * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle); // +Z is front, -Z is back

      // Patella protrusion at front of knee (v ≈ 0.48 to 0.54, front)
      const isFront = Math.max(0, sinA);
      const kneeMask = smoothstep(0.44, 0.49, v) * (1 - smoothstep(0.51, 0.56, v));
      const patella = isFront * kneeMask * Math.pow(Math.abs(cosA), 0.5) * 0.010;

      // Popliteal fossa (recess behind knee)
      const isBack = Math.max(0, -sinA);
      const popliteal = isBack * kneeMask * (1 - Math.abs(cosA)) * 0.008;

      const px = cx + cosA * rx;
      const py = y;
      const pz = cz + sinA * (rz + patella - popliteal);

      positions.push(px, py, pz);
      uvs.push(u, v);

      // Morph deltas: hips expand outer upper thigh
      const hdX = cosA * hipWeight * 0.018 * sideSign;
      const hdZ = sinA * hipWeight * 0.012;
      hipAttr.push(hdX, 0, hdZ);
      bustAttr.push(0, 0, 0);
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

/**
 * Creates anatomically sculpted arm geometry (Deltoid cap, Bicep/Tricep, Elbow, Forearm, Wrist).
 * Naturally angled in fashion A-pose matching Solenne reference.
 */
export function createAnatomicalArm(isLeft = true, radial = 24, stacks = 48) {
  const positions = [];
  const uvs = [];
  const bustAttr = [];
  const hipAttr = [];

  const sideSign = isLeft ? -1 : 1;
  const yShoulder = 1.34;
  const yWrist = 0.82;
  const totalH = yShoulder - yWrist;

  for (let i = 0; i <= stacks; i++) {
    const v = i / stacks; // 0 is wrist, 1 is shoulder
    const y = yWrist + v * totalH;

    // Natural A-pose arm centerline (abducted outward ~16 degrees)
    const armAngle = 0.18; // radians
    const cx = sideSign * (0.29 - Math.sin(armAngle) * (y - yWrist));
    const cz = lerp(0.015, -0.010, v); // slight forward relaxed poise

    let rx = 0.024;
    let rz = 0.024;

    if (v > 0.80) {
      // Deltoid shoulder cap blending into torso (y: 1.24 -> 1.34)
      const t = (v - 0.80) / 0.20;
      rx = lerp(0.038, 0.054, t);
      rz = lerp(0.040, 0.056, t);
    } else if (v > 0.45) {
      // Upper arm / bicep / tricep (y: 1.05 -> 1.24)
      const t = (v - 0.45) / 0.35;
      rx = lerp(0.030, 0.038, t);
      rz = lerp(0.032, 0.040, t);
    } else if (v > 0.35) {
      // Elbow articulation (y: 1.00 -> 1.05)
      rx = 0.028;
      rz = 0.030;
    } else {
      // Forearm tapering to wrist (y: 0.82 -> 1.00)
      const t = v / 0.35;
      rx = lerp(0.019, 0.028, t);
      rz = lerp(0.021, 0.029, t);
    }

    for (let j = 0; j <= radial; j++) {
      const u = j / radial;
      const angle = u * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Subtle elbow olecranon bone point at back
      const isBack = Math.max(0, -sinA);
      const elbowMask = smoothstep(0.35, 0.40, v) * (1 - smoothstep(0.42, 0.48, v));
      const olecranon = isBack * elbowMask * 0.006;

      const px = cx + cosA * rx;
      const py = y;
      const pz = cz + sinA * (rz + olecranon);

      positions.push(px, py, pz);
      uvs.push(u, v);
      bustAttr.push(0, 0, 0);
      hipAttr.push(0, 0, 0);
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

function rotateVectorAttribute(attr, rotation) {
  if (!attr) return;
  const euler = new THREE.Euler(rotation[0] || 0, rotation[1] || 0, rotation[2] || 0, "XYZ");
  const rotMatrix = new THREE.Matrix4().makeRotationFromEuler(euler);
  const v = new THREE.Vector3();
  for (let i = 0; i < attr.count; i++) {
    v.set(attr.getX(i), attr.getY(i), attr.getZ(i));
    v.applyMatrix4(rotMatrix);
    attr.setXYZ(i, v.x, v.y, v.z);
  }
  attr.needsUpdate = true;
}

export function transformAroundPivot(geo, pivot, rotation = [0, 0, 0], translation = [0, 0, 0]) {
  geo.translate(-pivot[0], -pivot[1], -pivot[2]);
  if (rotation[2]) geo.rotateZ(rotation[2]);
  if (rotation[1]) geo.rotateY(rotation[1]);
  if (rotation[0]) geo.rotateX(rotation[0]);
  geo.translate(pivot[0] + (translation[0] || 0), pivot[1] + (translation[1] || 0), pivot[2] + (translation[2] || 0));

  // Rotate custom morph deltas along local body axes
  if (rotation[0] || rotation[1] || rotation[2]) {
    if (geo.attributes.bustDelta) {
      rotateVectorAttribute(geo.attributes.bustDelta, rotation);
    }
    if (geo.attributes.hipDelta) {
      rotateVectorAttribute(geo.attributes.hipDelta, rotation);
    }
  }

  geo.userData.base = geo.attributes.position.array.slice();
}

/**
 * Creates one continuous, unified manifold human body geometry for Solenne.
 * Welds the neck to the head, shoulders to arms, wrists to hands, pelvis to legs,
 * and ankles to feet so the entire character reads as one coherent human with zero seams.
 * Supports editorial kinematic pose configurations.
 */
export function createUnifiedCharacterBody({
  torsoGeo,
  headGeo,
  legLeftGeo,
  legRightGeo,
  armLeftGeo,
  armRightGeo,
  handLeftGeo,
  handRightGeo,
  footLeftGeo,
  footRightGeo
}, poseConfig = null) {

  // Clone parts and position into world alignment
  const t = torsoGeo.clone();

  const h = headGeo.clone();
  h.translate(0, 1.56, 0);

  const lL = legLeftGeo.clone();
  const lR = legRightGeo.clone();
  const aL = armLeftGeo.clone();
  const aR = armRightGeo.clone();

  const haL = handLeftGeo.clone();
  haL.translate(-0.35, 0.82, 0.015);

  const haR = handRightGeo.clone();
  haR.translate(0.35, 0.82, 0.015);

  const fL = footLeftGeo.clone();
  fL.translate(-0.076, 0.038, 0.03);

  const fR = footRightGeo.clone();
  fR.translate(0.076, 0.038, 0.03);

  // Apply kinematic pose offsets around anatomical joint pivots
  if (poseConfig) {
    if (poseConfig.torsoRot || poseConfig.pelvisOffset) {
      transformAroundPivot(t, [0, 0.85, 0], poseConfig.torsoRot || [0, 0, 0], poseConfig.pelvisOffset || [0, 0, 0]);
    }
    if (poseConfig.headRot) {
      transformAroundPivot(h, [0, 1.48, 0], poseConfig.headRot);
    }
    if (poseConfig.leftArmRot) {
      transformAroundPivot(aL, [-0.19, 1.34, 0], poseConfig.leftArmRot);
      transformAroundPivot(haL, [-0.19, 1.34, 0], poseConfig.leftArmRot);
    }
    if (poseConfig.rightArmRot) {
      transformAroundPivot(aR, [0.19, 1.34, 0], poseConfig.rightArmRot);
      transformAroundPivot(haR, [0.19, 1.34, 0], poseConfig.rightArmRot);
    }
    if (poseConfig.leftLegRot || poseConfig.leftLegOffset) {
      transformAroundPivot(lL, [-0.076, 0.78, 0], poseConfig.leftLegRot || [0, 0, 0], poseConfig.leftLegOffset || [0, 0, 0]);
      transformAroundPivot(fL, [-0.076, 0.78, 0], poseConfig.leftLegRot || [0, 0, 0], poseConfig.leftLegOffset || [0, 0, 0]);
    }
    if (poseConfig.rightLegRot || poseConfig.rightLegOffset) {
      transformAroundPivot(lR, [0.076, 0.78, 0], poseConfig.rightLegRot || [0, 0, 0], poseConfig.rightLegOffset || [0, 0, 0]);
      transformAroundPivot(fR, [0.076, 0.78, 0], poseConfig.rightLegRot || [0, 0, 0], poseConfig.rightLegOffset || [0, 0, 0]);
    }
  }

  const rawParts = [t, h, lL, lR, aL, aR, haL, haR, fL, fR];

  // Convert all to non-indexed for uniform merge
  const nonIndexedParts = rawParts.map((geo) => (geo.index ? geo.toNonIndexed() : geo));

  // Merge and weld boundary vertices across all joints
  if (typeof BufferGeometryUtils.mergeGeometries === "function") {
    const merged = BufferGeometryUtils.mergeGeometries(nonIndexedParts, true);
    if (merged && typeof BufferGeometryUtils.mergeVertices === "function") {
      const welded = BufferGeometryUtils.mergeVertices(merged, 0.005);
      welded.computeVertexNormals();
      welded.userData.base = welded.attributes.position.array.slice();
      return welded;
    }
    if (merged) {
      merged.computeVertexNormals();
      merged.userData.base = merged.attributes.position.array.slice();
      return merged;
    }
  }

  // Fallback return torso if merge utility not available
  t.userData.base = t.attributes.position.array.slice();
  return t;
}

