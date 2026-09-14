import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { createTorsoGeometry, createAnatomicalLeg, createAnatomicalArm } from "../figure/body/BodyMesh.js";
import { createAnatomicalHead } from "../figure/head/HeadMesh.js";
import { createAnatomicalHand } from "../figure/hands/HandMesh.js";
import { createAnatomicalFoot } from "../figure/feet/FootMesh.js";
import { bustAmt, hipAmt, applyMorph, createOffsetGarmentShell } from "../figure/morphs/MorphSystem.js";
import { getSolenneMaterials } from "../figure/materials/MaterialSystem.js";

describe("Solenne Character Model Architecture", () => {
  describe("Anatomical Torso Geometry", () => {
    it("generates a continuous manifold torso with morph attributes", () => {
      const torso = createTorsoGeometry(32, 40);
      expect(torso).toBeInstanceOf(THREE.BufferGeometry);

      const pos = torso.attributes.position;
      const uvs = torso.attributes.uv;
      const bustDelta = torso.attributes.bustDelta;
      const hipDelta = torso.attributes.hipDelta;

      expect(pos.count).toBeGreaterThan(1000);
      expect(uvs.count).toBe(pos.count);
      expect(bustDelta.count).toBe(pos.count);
      expect(hipDelta.count).toBe(pos.count);

      // Verify bounds
      torso.computeBoundingBox();
      const bb = torso.boundingBox;
      expect(bb.min.y).toBeCloseTo(0.76, 2);
      expect(bb.max.y).toBeCloseTo(1.48, 2);
    });

    it("has non-zero morph deltas at bust and hip regions", () => {
      const torso = createTorsoGeometry(32, 40);
      const bustDelta = torso.attributes.bustDelta;
      const hipDelta = torso.attributes.hipDelta;

      let maxBustDelta = 0;
      let maxHipDelta = 0;

      for (let i = 0; i < bustDelta.count; i++) {
        maxBustDelta = Math.max(maxBustDelta, Math.abs(bustDelta.getZ(i)));
        maxHipDelta = Math.max(maxHipDelta, Math.abs(hipDelta.getX(i)));
      }

      expect(maxBustDelta).toBeGreaterThan(0.01);
      expect(maxHipDelta).toBeGreaterThan(0.01);
    });
  });

  describe("Anatomical Limbs, Hands, and Feet", () => {
    it("creates articulated anatomical legs with patella definition", () => {
      const leg = createAnatomicalLeg(true, 16, 24);
      expect(leg.attributes.position.count).toBeGreaterThan(200);
      leg.computeBoundingBox();
      expect(leg.boundingBox.max.y).toBeCloseTo(0.82, 1);
      expect(leg.boundingBox.min.y).toBeCloseTo(0.08, 1);
    });

    it("creates naturally angled A-pose arms", () => {
      const arm = createAnatomicalArm(true, 16, 24);
      expect(arm.attributes.position.count).toBeGreaterThan(200);
      arm.computeBoundingBox();
      expect(arm.boundingBox.max.y).toBeCloseTo(1.34, 1);
      expect(arm.boundingBox.min.y).toBeCloseTo(0.82, 1);
    });

    it("creates sculpted hands with articulated fingers and palm", () => {
      const hand = createAnatomicalHand(true);
      expect(hand.attributes.position.count).toBeGreaterThan(100);
      // Extremities must have zero bust/hip deltas to prevent stretching
      const bd = hand.attributes.bustDelta;
      for (let i = 0; i < bd.count; i++) {
        expect(bd.getX(i)).toBe(0);
        expect(bd.getY(i)).toBe(0);
        expect(bd.getZ(i)).toBe(0);
      }
    });

    it("creates sculpted feet with arch and heel", () => {
      const { footGeo, nailGeo } = createAnatomicalFoot(true);
      expect(footGeo.attributes.position.count).toBeGreaterThan(100);
      expect(nailGeo.attributes.position.count).toBeGreaterThan(0);
    });
  });

  describe("Anatomical Head and Facial Sockets", () => {
    it("creates sculpted cranium with brow and orbital sockets", () => {
      const head = createAnatomicalHead(32, 24);
      expect(head.attributes.position.count).toBeGreaterThan(500);
      head.computeBoundingBox();
      // Head should be taller than wide
      const width = head.boundingBox.max.x - head.boundingBox.min.x;
      const height = head.boundingBox.max.y - head.boundingBox.min.y;
      expect(height).toBeGreaterThan(width);
    });
  });

  describe("Morph and Garment Coupling", () => {
    it("applies bust and hip morphs correctly without NaN", () => {
      const torso = createTorsoGeometry(16, 20);
      const mesh = new THREE.Mesh(torso);

      applyMorph(mesh, 1.0, 1.0);
      const pos = mesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        expect(Number.isNaN(pos.getX(i))).toBe(false);
        expect(Number.isNaN(pos.getY(i))).toBe(false);
        expect(Number.isNaN(pos.getZ(i))).toBe(false);
      }

      applyMorph(mesh, 0.0, 0.0);
      for (let i = 0; i < pos.count; i++) {
        expect(Number.isNaN(pos.getX(i))).toBe(false);
        expect(Number.isNaN(pos.getY(i))).toBe(false);
        expect(Number.isNaN(pos.getZ(i))).toBe(false);
      }
    });

    it("creates synchronized garment shells inheriting morph deltas", () => {
      const torso = createTorsoGeometry(16, 20);
      const shell = createOffsetGarmentShell(torso, 0.01, 0.5, 0.8);
      expect(shell.attributes.position.count).toBeGreaterThan(0);
      expect(shell.attributes.bustDelta.count).toBe(shell.attributes.position.count);
      expect(shell.attributes.hipDelta.count).toBe(shell.attributes.position.count);
    });
  });

  describe("PBR Material Library", () => {
    it("provides physical materials with sheen and clearcoat", () => {
      const mats = getSolenneMaterials();
      expect(mats.skin).toBeInstanceOf(THREE.MeshPhysicalMaterial);
      expect(mats.eyeCornea).toBeInstanceOf(THREE.MeshPhysicalMaterial);
      expect(mats.hair).toBeInstanceOf(THREE.MeshPhysicalMaterial);
      expect(mats.dress).toBeInstanceOf(THREE.MeshPhysicalMaterial);

      // Verify skin is not orange plastic
      expect(mats.skin.roughness).toBeGreaterThanOrEqual(0.35);
      expect(mats.skin.sheen).toBeGreaterThan(0.3);
      expect(mats.skin.clearcoat).toBeGreaterThan(0.05);
    });
  });
});
