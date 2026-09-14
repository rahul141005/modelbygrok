import { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useViewer } from "../state.jsx";
import { getSolenneMaterials, applySolenneFaceMap } from "./materials/MaterialSystem.js";
import {
  createTorsoGeometry,
  createAnatomicalLeg,
  createAnatomicalArm,
  createUnifiedCharacterBody
} from "./body/BodyMesh.js";
import { createAnatomicalHead } from "./head/HeadMesh.js";
import FaceFeatures from "./face/FaceFeatures.jsx";
import HairSystem from "./hair/HairSystem.jsx";
import { createAnatomicalHand } from "./hands/HandMesh.js";
import { createAnatomicalFoot } from "./feet/FootMesh.js";
import ClothingSystem from "./clothing/ClothingSystem.jsx";
import AccessorySystem from "./accessories/AccessorySystem.jsx";
import { POSE_PRESETS } from "../presets/posePresets.js";
import { morphAll } from "./morphs/MorphSystem.js";

const NAIL_COLORS = {
  natural: "#c98f8c",
  subtlePink: "#d8a6a6",
  nude: "#c2a293",
  red: "#9b1b28",
  dark: "#251a20"
};

function transformAroundPivot(geo, pivot, rotation = [0, 0, 0], translation = [0, 0, 0]) {
  geo.translate(-pivot[0], -pivot[1], -pivot[2]);
  if (rotation[2]) geo.rotateZ(rotation[2]);
  if (rotation[1]) geo.rotateY(rotation[1]);
  if (rotation[0]) geo.rotateX(rotation[0]);
  geo.translate(pivot[0] + (translation[0] || 0), pivot[1] + (translation[1] || 0), pivot[2] + (translation[2] || 0));
}

function LoadingPlaceholder() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "var(--muted)",
        fontSize: 12,
        letterSpacing: "0.08em",
        textTransform: "uppercase"
      }}
    >
      Initializing Solenne...
    </div>
  );
}

/**
 * Solenne — High-Fidelity 3D Digital Fashion Model & Character Studio
 * Complete Reference-Driven Implementation:
 * - Seamless, welded, continuous human body topology with zero gaps
 * - Expressive 3D facial system (9 editorial expressions, eye optics, sculpted nose & lips)
 * - Layered multi-hairstyle engine (6 styles, 5 shades)
 * - Kinematic fashion posing (8 stances)
 * - Complete mix-and-match wardrobe & PBR fabric shaders
 * - Precious metal fine jewelry & accessories
 * - Synchronous vertex morph deformation
 */
export default function Solenne() {
  const {
    body,
    face,
    expression,
    eyes,
    hair,
    pose,
    wardrobe,
    accessories,
    beauty,
    bust,
    hips,
    outfit,
    faceTexture,
    clothed
  } = useViewer();

  const root = useRef();
  const [ready, setReady] = useState(false);

  // 1. Photorealistic Physical Materials
  const mats = useMemo(() => getSolenneMaterials(), []);

  // Dynamic Nail Polish Material
  const nailMat = useMemo(() => {
    const col = NAIL_COLORS[beauty?.nails] || NAIL_COLORS.natural;
    const m = mats.nail.clone();
    m.color = new THREE.Color(col);
    m.clearcoat = 0.85;
    m.clearcoatRoughness = 0.1;
    return m;
  }, [mats.nail, beauty?.nails]);

  // Multi-material group array for the unified body mesh
  const bodyMaterials = useMemo(() => [
    mats.skin, // 0: Torso
    mats.face, // 1: Head & Face
    mats.skin, // 2: Left Leg
    mats.skin, // 3: Right Leg
    mats.skin, // 4: Left Arm
    mats.skin, // 5: Right Arm
    mats.skin, // 6: Left Hand
    mats.skin, // 7: Right Hand
    mats.skin, // 8: Left Foot
    mats.skin  // 9: Right Foot
  ], [mats]);

  // Active pose kinematics configuration
  const poseConfig = useMemo(() => {
    return POSE_PRESETS[pose] || POSE_PRESETS.neutral;
  }, [pose]);

  // 2. Continuous Anatomical Geometries with Pose Kinematics
  const geos = useMemo(() => {
    // Individual anatomical sections
    const torso = createTorsoGeometry(48, 64);
    const head = createAnatomicalHead(48, 36, face);
    const legLeft = createAnatomicalLeg(true, 28, 44);
    const legRight = createAnatomicalLeg(false, 28, 44);
    const armLeft = createAnatomicalArm(true, 24, 40);
    const armRight = createAnatomicalArm(false, 24, 40);
    const handLeft = createAnatomicalHand(true);
    const handRight = createAnatomicalHand(false);
    const footLeft = createAnatomicalFoot(true);
    const footRight = createAnatomicalFoot(false);

    // Merge & weld into a single continuous, manifold human body mesh
    const unifiedBody = createUnifiedCharacterBody({
      torsoGeo: torso,
      headGeo: head,
      legLeftGeo: legLeft,
      legRightGeo: legRight,
      armLeftGeo: armLeft,
      armRightGeo: armRight,
      handLeftGeo: handLeft,
      handRightGeo: handRight,
      footLeftGeo: footLeft.footGeo,
      footRightGeo: footRight.footGeo
    }, poseConfig);

    // Transform toenail geometry to match posed foot
    const nailLeft = footLeft.nailGeo.clone();
    nailLeft.translate(-0.076, 0.038, 0.03);
    if (poseConfig.leftLegRot || poseConfig.leftLegOffset) {
      transformAroundPivot(nailLeft, [-0.076, 0.78, 0], poseConfig.leftLegRot || [0, 0, 0], poseConfig.leftLegOffset || [0, 0, 0]);
    }

    const nailRight = footRight.nailGeo.clone();
    nailRight.translate(0.076, 0.038, 0.03);
    if (poseConfig.rightLegRot || poseConfig.rightLegOffset) {
      transformAroundPivot(nailRight, [0.076, 0.78, 0], poseConfig.rightLegRot || [0, 0, 0], poseConfig.rightLegOffset || [0, 0, 0]);
    }

    // Posed Torso for synchronized clothing fit in any kinematic stance
    const posedTorso = torso.clone();
    if (poseConfig.torsoRot || poseConfig.pelvisOffset) {
      transformAroundPivot(posedTorso, [0, 0.85, 0], poseConfig.torsoRot || [0, 0, 0], poseConfig.pelvisOffset || [0, 0, 0]);
    }

    setReady(true);
    return {
      torso,
      posedTorso,
      unifiedBody,
      nailLeft,
      nailRight
    };
  }, [poseConfig, face]);

  // Cleanup WebGL buffer geometries on recreation/unmount to prevent memory leaks
  useLayoutEffect(() => {
    return () => {
      if (geos) {
        geos.torso?.dispose();
        geos.posedTorso?.dispose();
        geos.unifiedBody?.dispose();
        geos.nailLeft?.dispose();
        geos.nailRight?.dispose();
      }
    };
  }, [geos]);

  // 3. Drive Vertex Morphs on Body and Wardrobe Synchronously
  useLayoutEffect(() => {
    if (root.current) {
      morphAll(root.current, bust, hips);
    }
  }, [bust, hips, geos]);

  // 4. Face Overlay Management (Policy-Safe, Clothed Looks Only)
  useLayoutEffect(() => {
    applySolenneFaceMap(clothed ? faceTexture : null);
  }, [faceTexture, clothed]);

  if (!ready) return <LoadingPlaceholder />;

  const headY = 1.56 + (poseConfig.pelvisOffset ? poseConfig.pelvisOffset[1] : 0);
  const headZ = poseConfig.pelvisOffset ? poseConfig.pelvisOffset[2] : 0;
  const headRot = poseConfig.headRot || [0, 0, 0];

  return (
    <group
      ref={root}
      position={[0, 0.02, 0]}
      scale={[1 + (body?.shoulderWidth || 0), body?.heightScale || 1.0, 1]}
      name="character_solenne"
    >
      {/* 1. One Coherent, Continuous Human Body Mesh (Zero Seams, Zero Gaps) */}
      <mesh
        geometry={geos.unifiedBody}
        material={bodyMaterials}
        castShadow
        receiveShadow
        name="unified_human_body"
      />

      {/* 2. 3D Facial Structures, Volumetric Hair & Head Jewelry */}
      <group position={[0, headY, headZ]} rotation={headRot} name="head_assembly">
        <FaceFeatures
          mats={mats}
          faceMorphs={face}
          expression={expression}
          eyes={eyes}
          beauty={beauty}
        />
        <HairSystem mats={mats} hairState={hair} />
        <AccessorySystem accessories={accessories} mode="head" />
      </group>

      {/* 3. Subtle Toenail Accents */}
      <mesh geometry={geos.nailLeft} material={nailMat} name="toenails_left" />
      <mesh geometry={geos.nailRight} material={nailMat} name="toenails_right" />

      {/* 4. Body & Hand Accessories (Bracelets, Rings) */}
      <AccessorySystem accessories={accessories} mode="body" poseConfig={poseConfig} />

      {/* 5. Tailored Wardrobe System */}
      <ClothingSystem
        bodyGeo={geos.posedTorso}
        wardrobe={wardrobe}
        outfit={outfit}
        mats={mats}
        poseConfig={poseConfig}
      />
    </group>
  );
}
