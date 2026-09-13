import * as THREE from "three";

function hairMaterial(color, opacity = 1) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.32,
    metalness: 0.04,
    sheen: 0.4,
    sheenColor: new THREE.Color("#5a3a28"),
    clearcoat: 0.18,
    clearcoatRoughness: 0.4,
    side: THREE.DoubleSide,
    transparent: opacity < 1,
    opacity
  });
}

export function makeHair() {
  const g = new THREE.Group();
  g.name = "hair";
  const col = new THREE.Color("#2a1a12");
  const hi = new THREE.Color("#3d281c");

  const cap = new THREE.Mesh(
    new THREE.SphereGeometry(0.118, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hairMaterial(col)
  );
  cap.scale.set(1.05, 1.12, 1.08);
  cap.position.set(0, 0.02, -0.01);
  cap.castShadow = true;
  g.add(cap);

  for (let i = 0; i < 28; i++) {
    const t = i / 27;
    const x = (t - 0.5) * 0.22;
    const len = 0.55 + Math.sin(t * Math.PI) * 0.18;
    const geo = new THREE.CylinderGeometry(0.012, 0.006, len, 6, 8, true);
    const pos = geo.attributes.position;
    for (let k = 0; k < pos.count; k++) {
      const y = pos.getY(k);
      const u = (y + len / 2) / len;
      pos.setX(k, pos.getX(k) + Math.sin(u * 3.1 + t * 4) * 0.018 * u);
      pos.setZ(k, pos.getZ(k) + u * 0.04);
    }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, hairMaterial(i % 2 ? hi : col, 0.96));
    m.position.set(x, -len * 0.28, -0.05);
    m.rotation.z = x * 0.6;
    m.rotation.x = 0.25;
    m.castShadow = true;
    g.add(m);
  }

  const bun = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 12), hairMaterial(hi));
  bun.position.set(0, 0.02, -0.1);
  bun.scale.set(1.4, 0.7, 1);
  g.add(bun);
  return g;
}
