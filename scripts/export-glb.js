/**
 * Offline GLB Export Pipeline for Solenne
 * Runs in Node.js to export the Solenne 3D Character Model directly to a standalone .glb binary asset.
 *
 * Usage: node scripts/export-glb.js
 */

import fs from "fs";
import path from "path";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import {
  createTorsoGeometry,
  createAnatomicalLeg,
  createAnatomicalArm,
  createUnifiedCharacterBody
} from "../src/figure/body/BodyMesh.js";
import { createAnatomicalHead } from "../src/figure/head/HeadMesh.js";
import { createAnatomicalHand } from "../src/figure/hands/HandMesh.js";
import { createAnatomicalFoot } from "../src/figure/feet/FootMesh.js";

// Polyfill FileReader for Node.js environment
class NodeFileReader {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = buf;
      if (this.onloadend) this.onloadend();
      if (this.onload) this.onload();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buf) => {
      this.result = "data:application/octet-stream;base64," + Buffer.from(buf).toString("base64");
      if (this.onloadend) this.onloadend();
      if (this.onload) this.onload();
    });
  }
}
globalThis.FileReader = NodeFileReader;

async function buildAndExport() {
  console.log("Constructing unified Solenne 3D Model Scene for GLB export...");

  const scene = new THREE.Scene();
  scene.name = "Solenne_Character";

  // Standard PBR export materials
  const skinMat = new THREE.MeshStandardMaterial({
    name: "Skin_PBR",
    color: 0xdcb8a2,
    roughness: 0.45,
    metalness: 0.0
  });

  const headMat = new THREE.MeshStandardMaterial({
    name: "Head_Face_PBR",
    color: 0xdcb8a2,
    roughness: 0.42,
    metalness: 0.0
  });

  const materials = [
    skinMat, // Torso
    headMat, // Head
    skinMat, // Leg L
    skinMat, // Leg R
    skinMat, // Arm L
    skinMat, // Arm R
    skinMat, // Hand L
    skinMat, // Hand R
    skinMat, // Foot L
    skinMat  // Foot R
  ];

  // Build anatomical sections
  const torso = createTorsoGeometry(48, 64);
  const head = createAnatomicalHead(48, 36);
  const legL = createAnatomicalLeg(true, 28, 44);
  const legR = createAnatomicalLeg(false, 28, 44);
  const armL = createAnatomicalArm(true, 24, 40);
  const armR = createAnatomicalArm(false, 24, 40);
  const handL = createAnatomicalHand(true);
  const handR = createAnatomicalHand(false);
  const footL = createAnatomicalFoot(true);
  const footR = createAnatomicalFoot(false);

  // Weld into single coherent continuous human body
  const unifiedBodyGeo = createUnifiedCharacterBody({
    torsoGeo: torso,
    headGeo: head,
    legLeftGeo: legL,
    legRightGeo: legR,
    armLeftGeo: armL,
    armRightGeo: armR,
    handLeftGeo: handL,
    handRightGeo: handR,
    footLeftGeo: footL.footGeo,
    footRightGeo: footR.footGeo
  });

  const unifiedMesh = new THREE.Mesh(unifiedBodyGeo, materials);
  unifiedMesh.name = "Solenne_Unified_Body";
  scene.add(unifiedMesh);

  console.log("Total Meshes in Scene:", scene.children.length);
  console.log("Unified Body Vertex Count:", unifiedBodyGeo.attributes.position.count);

  const outputDir = path.resolve("public/models");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, "solenne.glb");

  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (gltfBinary) => {
      fs.writeFileSync(outputPath, Buffer.from(gltfBinary));
      console.log(`GLB Asset successfully exported to ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
    },
    (err) => {
      console.error("Failed to export GLB:", err);
    },
    { binary: true }
  );
}

buildAndExport().catch(console.error);
