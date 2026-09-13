import * as THREE from "three";
import { makeBodyAlbedo, makeFaceAlbedo, makeFabric, makeSkinNormal, toTexture } from "./textures.js";

let cache;

export function getMaterials() {
  if (cache) return cache;

  const bodyMap = toTexture(makeBodyAlbedo());
  const faceMap = toTexture(makeFaceAlbedo());
  const nrm = toTexture(makeSkinNormal(), { repeat: [3, 3] });
  nrm.colorSpace = THREE.NoColorSpace;

  const skin = new THREE.MeshPhysicalMaterial({
    map: bodyMap,
    normalMap: nrm,
    normalScale: new THREE.Vector2(0.35, 0.35),
    color: "#e8c4ad",
    roughness: 0.42,
    metalness: 0,
    sheen: 0.55,
    sheenRoughness: 0.38,
    sheenColor: new THREE.Color("#c98978"),
    clearcoat: 0.12,
    clearcoatRoughness: 0.55,
    iridescence: 0.04,
    iridescenceIOR: 1.3
  });

  const face = skin.clone();
  face.map = faceMap;
  face.normalScale = new THREE.Vector2(0.22, 0.22);

  const nail = new THREE.MeshPhysicalMaterial({
    color: "#c48a86",
    roughness: 0.28,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2
  });

  const eyeWhite = new THREE.MeshPhysicalMaterial({
    color: "#f3efe8",
    roughness: 0.18,
    clearcoat: 0.7,
    clearcoatRoughness: 0.15
  });
  const iris = new THREE.MeshPhysicalMaterial({
    color: "#6b7344",
    roughness: 0.25,
    metalness: 0.05
  });
  const pupil = new THREE.MeshBasicMaterial({ color: "#120e0b" });
  const lip = new THREE.MeshPhysicalMaterial({
    color: "#b56b6a",
    roughness: 0.32,
    sheen: 0.5,
    sheenColor: new THREE.Color("#d48a88"),
    clearcoat: 0.25
  });
  const brow = new THREE.MeshStandardMaterial({ color: "#2a1a12", roughness: 0.7 });

  const lingerie = new THREE.MeshPhysicalMaterial({
    map: toTexture(makeFabric("#1c1418"), { repeat: [4, 4] }),
    color: "#2a1c22",
    roughness: 0.55,
    sheen: 0.8,
    sheenColor: new THREE.Color("#5a3a44"),
    side: THREE.DoubleSide
  });
  const casualTop = new THREE.MeshPhysicalMaterial({
    map: toTexture(makeFabric("#d8d2c6"), { repeat: [6, 6] }),
    color: "#e6dfd2",
    roughness: 0.72,
    sheen: 0.15,
    side: THREE.DoubleSide
  });
  const casualBottom = new THREE.MeshPhysicalMaterial({
    map: toTexture(makeFabric("#3a4654"), { repeat: [5, 5] }),
    color: "#4a5868",
    roughness: 0.68,
    side: THREE.DoubleSide
  });
  const dress = new THREE.MeshPhysicalMaterial({
    map: toTexture(makeFabric("#6a1c28"), { repeat: [8, 8] }),
    color: "#7a2430",
    roughness: 0.38,
    sheen: 0.45,
    sheenColor: new THREE.Color("#c45a62"),
    side: THREE.DoubleSide
  });
  const robe = new THREE.MeshPhysicalMaterial({
    map: toTexture(makeFabric("#c9b7a4"), { repeat: [5, 5] }),
    color: "#d4c4b0",
    roughness: 0.34,
    sheen: 0.7,
    sheenColor: new THREE.Color("#efe4d4"),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.96
  });

  cache = { skin, face, nail, eyeWhite, iris, pupil, lip, brow, lingerie, casualTop, casualBottom, dress, robe };
  return cache;
}

export function applyFaceMap(tex) {
  const mats = getMaterials();
  if (mats.face.userData.baseMap == null) mats.face.userData.baseMap = mats.face.map;
  mats.face.map = tex || mats.face.userData.baseMap;
  mats.face.needsUpdate = true;
}
