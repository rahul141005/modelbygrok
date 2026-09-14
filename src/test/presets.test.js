import { describe, it, expect } from "vitest";
import * as THREE from "three";
import { CHARACTER_PRESETS } from "../presets/characterPresets.js";
import { POSE_PRESETS } from "../presets/posePresets.js";
import { LIGHTING_PRESETS, CAMERA_PRESETS, STUDIO_BACKDROPS } from "../presets/lightingPresets.js";
import { HAIR_COLORS } from "../figure/hair/HairSystem.jsx";
import {
  createTorsoGeometry,
  createAnatomicalLeg,
  createAnatomicalArm,
  createUnifiedCharacterBody
} from "../figure/body/BodyMesh.js";
import { createAnatomicalHead } from "../figure/head/HeadMesh.js";
import { createAnatomicalHand } from "../figure/hands/HandMesh.js";
import { createAnatomicalFoot } from "../figure/feet/FootMesh.js";

describe("Solenne Character Presets & Studio Systems", () => {
  describe("Character Presets", () => {
    it("defines 6 complete coordinated presets with canonical reference", () => {
      const expectedPresets = ["reference", "editorial", "casual", "traditional", "evening", "summer"];
      expectedPresets.forEach((id) => {
        const p = CHARACTER_PRESETS[id];
        expect(p).toBeDefined();
        expect(p.body).toBeDefined();
        expect(p.face).toBeDefined();
        expect(p.eyes).toBeDefined();
        expect(p.hair).toBeDefined();
        expect(p.pose).toBeDefined();
        expect(p.wardrobe).toBeDefined();
        expect(p.accessories).toBeDefined();
        expect(p.beauty).toBeDefined();
      });
    });

    it("canonical reference preset contains intended ground truth values", () => {
      const ref = CHARACTER_PRESETS.reference;
      expect(ref.hair.style).toBe("waves");
      expect(ref.hair.color).toBe("darkChestnut");
      expect(ref.eyes.irisColor).toBe("hazelGreen");
      expect(ref.wardrobe.category).toBe("casual");
      expect(ref.wardrobe.top).toBe("cropTank");
      expect(ref.wardrobe.bottom).toBe("denimShorts");
      expect(ref.body.bust).toBeCloseTo(0.42, 2);
      expect(ref.body.hips).toBeCloseTo(0.48, 2);
    });
  });

  describe("Pose Kinematics Presets", () => {
    it("defines 8 editorial fashion poses with balanced angles", () => {
      const expectedPoses = [
        "neutral",
        "relaxed",
        "editorial",
        "handOnHip",
        "oneLegRelaxed",
        "crossedArms",
        "lookingOverShoulder",
        "confident"
      ];
      expectedPoses.forEach((id) => {
        const p = POSE_PRESETS[id];
        expect(p).toBeDefined();
        expect(p.headRot).toHaveLength(3);
        expect(p.leftArmRot).toHaveLength(3);
        expect(p.rightArmRot).toHaveLength(3);
      });
    });

    it("applies kinematic pose offsets to createUnifiedCharacterBody without NaN", () => {
      const torso = createTorsoGeometry(16, 20);
      const head = createAnatomicalHead(16, 16);
      const lL = createAnatomicalLeg(true, 12, 16);
      const lR = createAnatomicalLeg(false, 12, 16);
      const aL = createAnatomicalArm(true, 12, 16);
      const aR = createAnatomicalArm(false, 12, 16);
      const haL = createAnatomicalHand(true);
      const haR = createAnatomicalHand(false);
      const fL = createAnatomicalFoot(true);
      const fR = createAnatomicalFoot(false);

      const posedBody = createUnifiedCharacterBody({
        torsoGeo: torso,
        headGeo: head,
        legLeftGeo: lL,
        legRightGeo: lR,
        armLeftGeo: aL,
        armRightGeo: aR,
        handLeftGeo: haL,
        handRightGeo: haR,
        footLeftGeo: fL.footGeo,
        footRightGeo: fR.footGeo
      }, POSE_PRESETS.handOnHip);

      expect(posedBody).toBeInstanceOf(THREE.BufferGeometry);
      const pos = posedBody.attributes.position;
      expect(pos.count).toBeGreaterThan(500);

      for (let i = 0; i < pos.count; i++) {
        expect(Number.isNaN(pos.getX(i))).toBe(false);
        expect(Number.isNaN(pos.getY(i))).toBe(false);
        expect(Number.isNaN(pos.getZ(i))).toBe(false);
      }
    });
  });

  describe("Studio Lighting & Camera Director", () => {
    it("defines 6 studio lighting rigs with physical PBR parameters", () => {
      Object.values(LIGHTING_PRESETS).forEach((l) => {
        expect(l.keyLight.intensity).toBeGreaterThan(1.0);
        expect(l.fillLight.intensity).toBeGreaterThan(0.1);
        expect(l.rimLight.intensity).toBeGreaterThan(0.5);
      });
    });

    it("defines 6 camera setups covering full body, beauty, and profile", () => {
      expect(CAMERA_PRESETS.studio.position).toHaveLength(3);
      expect(CAMERA_PRESETS.portrait.position).toHaveLength(3);
      expect(CAMERA_PRESETS.beauty.position).toHaveLength(3);
      expect(CAMERA_PRESETS.runway.position).toHaveLength(3);
      expect(CAMERA_PRESETS.side.position).toHaveLength(3);
      expect(CAMERA_PRESETS.back.position).toHaveLength(3);
    });

    it("defines 4 backdrop environments", () => {
      expect(STUDIO_BACKDROPS.dark).toBeDefined();
      expect(STUDIO_BACKDROPS.warm).toBeDefined();
      expect(STUDIO_BACKDROPS.gray).toBeDefined();
      expect(STUDIO_BACKDROPS.editorial).toBeDefined();
    });
  });

  describe("Hair Colors", () => {
    it("defines realistic dark chestnut and espresso palette", () => {
      expect(HAIR_COLORS.darkChestnut.color).toBe("#2a1a12");
      expect(HAIR_COLORS.espressoBlack.color).toBe("#141112");
    });
  });
});
