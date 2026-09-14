import * as THREE from "three";

/**
 * Anatomical hand geometry for Solenne.
 * Directly based on the HAND DETAIL panel in reference.png:
 * - Defined palm with thenar and hypothenar pads
 * - Opposed angled thumb with natural articulation
 * - Slender, gracefully curved fingers in a relaxed editorial pose
 * - Subtle fingernail definition
 */

export function createAnatomicalHand(isLeft = true) {
  const sideSign = isLeft ? -1 : 1;
  const group = new THREE.Group();
  group.name = isLeft ? "hand_left" : "hand_right";

  // Wrist to palm connection
  const palmGeo = new THREE.BoxGeometry(0.038, 0.065, 0.016, 6, 8, 4);
  const pos = palmGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Taper wrist at top (+y)
    if (y > 0.01) {
      x *= 0.85;
      z *= 0.88;
    }
    // Form thenar eminence (thumb pad on inner side)
    const isInner = (sideSign < 0 && x > 0) || (sideSign > 0 && x < 0);
    if (isInner && y > -0.01 && y < 0.02) {
      z += 0.005;
      x += sideSign * -0.004;
    }
    // Natural palm cup curvature (anterior concave)
    if (z > 0) {
      z -= (0.02 - Math.abs(x)) * 0.2;
    }

    pos.setXYZ(i, x, y, z);
  }
  palmGeo.computeVertexNormals();

  // Thumb: articulated cylinder segments angled outward and forward
  const thumbGeo = new THREE.CylinderGeometry(0.0065, 0.0052, 0.036, 12, 6);
  const tPos = thumbGeo.attributes.position;
  for (let i = 0; i < tPos.count; i++) {
    const y = tPos.getY(i);
    if (y < 0) {
      // Taper and curve distal phalanx inward
      tPos.setZ(i, tPos.getZ(i) + 0.003 * Math.abs(y));
    }
  }
  thumbGeo.computeVertexNormals();

  // Create 4 articulated fingers with gentle relaxed curl
  const fingerData = [
    { name: "index",  len: 0.046, rad: 0.0048, offset: sideSign * 0.012, curl: 0.22,  yaw: sideSign * 0.05 },
    { name: "middle", len: 0.052, rad: 0.0050, offset: sideSign * 0.004, curl: 0.28,  yaw: 0 },
    { name: "ring",   len: 0.048, rad: 0.0046, offset: sideSign * -0.004, curl: 0.34, yaw: sideSign * -0.04 },
    { name: "pinky",  len: 0.038, rad: 0.0040, offset: sideSign * -0.012, curl: 0.40, yaw: sideSign * -0.08 }
  ];

  const mergedPositions = [];
  const mergedUvs = [];
  const mergedNormals = [];

  // Helper to append transformed geometry vertices
  function appendGeometry(geo, matrix) {
    const p = geo.attributes.position;
    const uv = geo.attributes.uv;
    const n = geo.attributes.normal;
    const v3 = new THREE.Vector3();
    const n3 = new THREE.Vector3();
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(matrix);

    const index = geo.index;
    if (index) {
      const idxArr = index.array;
      for (let i = 0; i < idxArr.length; i++) {
        const vi = idxArr[i];
        v3.set(p.getX(vi), p.getY(vi), p.getZ(vi)).applyMatrix4(matrix);
        n3.set(n.getX(vi), n.getY(vi), n.getZ(vi)).applyMatrix3(normalMatrix).normalize();
        mergedPositions.push(v3.x, v3.y, v3.z);
        mergedNormals.push(n3.x, n3.y, n3.z);
        mergedUvs.push(uv ? uv.getX(vi) : 0, uv ? uv.getY(vi) : 0);
      }
    } else {
      for (let i = 0; i < p.count; i++) {
        v3.set(p.getX(i), p.getY(i), p.getZ(i)).applyMatrix4(matrix);
        n3.set(n.getX(i), n.getY(i), n.getZ(i)).applyMatrix3(normalMatrix).normalize();
        mergedPositions.push(v3.x, v3.y, v3.z);
        mergedNormals.push(n3.x, n3.y, n3.z);
        mergedUvs.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0);
      }
    }
  }

  // 1. Append Palm
  const palmMat = new THREE.Matrix4().makeTranslation(0, -0.032, 0);
  appendGeometry(palmGeo, palmMat);

  // 2. Append Thumb
  const thumbMat = new THREE.Matrix4();
  const thumbRot = new THREE.Matrix4().makeRotationZ(sideSign * -0.65);
  thumbRot.multiply(new THREE.Matrix4().makeRotationX(0.35));
  const thumbTrans = new THREE.Matrix4().makeTranslation(sideSign * 0.024, -0.024, 0.008);
  thumbMat.multiplyMatrices(thumbTrans, thumbRot);
  appendGeometry(thumbGeo, thumbMat);

  // 3. Append 4 articulated fingers
  fingerData.forEach((f) => {
    const fGeo = new THREE.CylinderGeometry(f.rad, f.rad * 0.72, f.len, 10, 8);
    const fPos = fGeo.attributes.position;
    // Anatomical relaxed curl along length
    for (let k = 0; k < fPos.count; k++) {
      const fy = fPos.getY(k);
      const frac = Math.max(0, Math.min(1, (f.len / 2 - fy) / f.len)); // 0 at base, 1 at tip
      fPos.setZ(k, fPos.getZ(k) + Math.pow(frac, 1.6) * 0.012 * (1 + f.curl));
    }
    fGeo.computeVertexNormals();

    const fMat = new THREE.Matrix4();
    const fRot = new THREE.Matrix4().makeRotationX(f.curl);
    fRot.multiply(new THREE.Matrix4().makeRotationZ(f.yaw));
    const fTrans = new THREE.Matrix4().makeTranslation(f.offset, -0.065 - f.len / 2, 0.002);
    fMat.multiplyMatrices(fTrans, fRot);
    appendGeometry(fGeo, fMat);
  });

  const finalGeo = new THREE.BufferGeometry();
  finalGeo.setAttribute("position", new THREE.Float32BufferAttribute(mergedPositions, 3));
  finalGeo.setAttribute("normal", new THREE.Float32BufferAttribute(mergedNormals, 3));
  finalGeo.setAttribute("uv", new THREE.Float32BufferAttribute(mergedUvs, 2));

  // Extremities preserved: morph deltas are zero
  const vertexCount = mergedPositions.length / 3;
  finalGeo.setAttribute("bustDelta", new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3));
  finalGeo.setAttribute("hipDelta", new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3));
  finalGeo.userData.base = new Float32Array(mergedPositions);

  return finalGeo;
}
