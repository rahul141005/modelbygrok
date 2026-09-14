import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";

/**
 * PBR Precious Metals and Materials for Solenne's Jewelry
 */
export const JEWELRY_METALS = {
  gold: {
    color: "#dfb15b",
    metalness: 0.96,
    roughness: 0.16,
    clearcoat: 0.3
  },
  silver: {
    color: "#e6e8ec",
    metalness: 0.98,
    roughness: 0.12,
    clearcoat: 0.4
  },
  roseGold: {
    color: "#e8a89b",
    metalness: 0.93,
    roughness: 0.18,
    clearcoat: 0.3
  }
};

export default function AccessorySystem({ accessories = {}, mode = "all", poseConfig = null }) {
  const metalKey = accessories.metal || "gold";
  const metalConfig = JEWELRY_METALS[metalKey] || JEWELRY_METALS.gold;

  const metalMat = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: metalConfig.color,
      metalness: metalConfig.metalness,
      roughness: metalConfig.roughness,
      clearcoat: metalConfig.clearcoat,
      clearcoatRoughness: 0.1
    });
  }, [metalConfig]);

  const gemMat = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: "#ffffff",
      transmission: 0.85,
      opacity: 0.95,
      transparent: true,
      roughness: 0.05,
      ior: 2.417 // Diamond index of refraction
    });
  }, []);

  const lensMat = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: "#1a1618",
      roughness: 0.08,
      metalness: 0.3,
      transmission: 0.72,
      transparent: true,
      opacity: 0.92,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04
    });
  }, []);

  useLayoutEffect(() => {
    return () => {
      metalMat?.dispose();
      gemMat?.dispose();
      lensMat?.dispose();
    };
  }, [metalMat, gemMat, lensMat]);

  const {
    earrings = "none",
    necklace = "none",
    sunglasses = "none",
    bracelet = "none",
    ring = "none"
  } = accessories;

  const showHead = mode === "all" || mode === "head";
  const showBody = mode === "all" || mode === "body";

  return (
    <group name={`accessory_system_${mode}`}>
      {/* 1. EARRINGS (Head space relative to head base [0, 1.56, 0]) */}
      {showHead && earrings === "goldHoops" && (
        <group name="earrings_hoops">
          <mesh position={[-0.076, 0.005, 0.015]} rotation={[0, 0, Math.PI * 0.5]} material={metalMat} castShadow>
            <torusGeometry args={[0.016, 0.0022, 16, 32]} />
          </mesh>
          <mesh position={[0.076, 0.005, 0.015]} rotation={[0, 0, Math.PI * 0.5]} material={metalMat} castShadow>
            <torusGeometry args={[0.016, 0.0022, 16, 32]} />
          </mesh>
        </group>
      )}

      {showHead && earrings === "statementDrops" && (
        <group name="earrings_drops">
          <mesh position={[-0.076, -0.018, 0.015]} material={gemMat} castShadow>
            <coneGeometry args={[0.006, 0.024, 16]} />
          </mesh>
          <mesh position={[0.076, -0.018, 0.015]} material={gemMat} castShadow>
            <coneGeometry args={[0.006, 0.024, 16]} />
          </mesh>
        </group>
      )}

      {showHead && earrings === "jhumka" && (
        <group name="earrings_jhumka">
          <mesh position={[-0.076, -0.012, 0.015]} rotation={[Math.PI, 0, 0]} material={metalMat} castShadow>
            <coneGeometry args={[0.010, 0.012, 16, 1, true]} />
          </mesh>
          <mesh position={[0.076, -0.012, 0.015]} rotation={[Math.PI, 0, 0]} material={metalMat} castShadow>
            <coneGeometry args={[0.010, 0.012, 16, 1, true]} />
          </mesh>
          {/* Hanging micro bead */}
          <mesh position={[-0.076, -0.022, 0.015]} material={metalMat}>
            <sphereGeometry args={[0.003, 12, 12]} />
          </mesh>
          <mesh position={[0.076, -0.022, 0.015]} material={metalMat}>
            <sphereGeometry args={[0.003, 12, 12]} />
          </mesh>
        </group>
      )}

      {showHead && earrings === "diamondStuds" && (
        <group name="earrings_studs">
          <mesh position={[-0.074, 0.008, 0.018]} material={gemMat}>
            <sphereGeometry args={[0.004, 16, 16]} />
          </mesh>
          <mesh position={[0.074, 0.008, 0.018]} material={gemMat}>
            <sphereGeometry args={[0.004, 16, 16]} />
          </mesh>
        </group>
      )}

      {/* 2. NECKLACES */}
      {showHead && necklace === "delicateChain" && (
        <mesh position={[0, -0.165, 0.052]} rotation={[Math.PI * 0.28, 0, 0]} material={metalMat} castShadow>
          <torusGeometry args={[0.072, 0.002, 16, 36, Math.PI * 0.9]} />
        </mesh>
      )}

      {showHead && necklace === "choker" && (
        <mesh position={[0, -0.105, 0.018]} rotation={[Math.PI * 0.06, 0, 0]} material={metalMat} castShadow>
          <torusGeometry args={[0.056, 0.004, 16, 36, Math.PI * 0.9]} />
        </mesh>
      )}

      {showHead && necklace === "pendant" && (
        <group name="necklace_pendant">
          <mesh position={[0, -0.165, 0.052]} rotation={[Math.PI * 0.28, 0, 0]} material={metalMat} castShadow>
            <torusGeometry args={[0.074, 0.002, 16, 36, Math.PI * 0.9]} />
          </mesh>
          <mesh position={[0, -0.210, 0.078]} material={gemMat} castShadow>
            <octahedronGeometry args={[0.007]} />
          </mesh>
        </group>
      )}

      {/* 3. SUNGLASSES */}
      {showHead && sunglasses === "aviator" && (
        <group position={[0, 0.018, 0.096]} name="sunglasses_aviator">
          {/* Wire frame bridge */}
          <mesh position={[0, 0.004, 0]} rotation={[0, 0, Math.PI * 0.5]} material={metalMat}>
            <cylinderGeometry args={[0.0012, 0.0012, 0.024, 8]} />
          </mesh>
          {/* Left Lens & Rim */}
          <mesh position={[-0.032, -0.004, 0]} material={lensMat}>
            <circleGeometry args={[0.018, 24]} />
          </mesh>
          <mesh position={[-0.032, -0.004, 0]} material={metalMat}>
            <ringGeometry args={[0.0175, 0.019, 24]} />
          </mesh>
          {/* Right Lens & Rim */}
          <mesh position={[0.032, -0.004, 0]} material={lensMat}>
            <circleGeometry args={[0.018, 24]} />
          </mesh>
          <mesh position={[0.032, -0.004, 0]} material={metalMat}>
            <ringGeometry args={[0.0175, 0.019, 24]} />
          </mesh>
          {/* Temples */}
          <mesh position={[-0.056, 0, -0.045]} rotation={[0, -Math.PI * 0.08, 0]} material={metalMat}>
            <cylinderGeometry args={[0.001, 0.001, 0.09, 8]} />
          </mesh>
          <mesh position={[0.056, 0, -0.045]} rotation={[0, Math.PI * 0.08, 0]} material={metalMat}>
            <cylinderGeometry args={[0.001, 0.001, 0.09, 8]} />
          </mesh>
        </group>
      )}

      {showHead && sunglasses === "catEye" && (
        <group position={[0, 0.018, 0.096]} name="sunglasses_catEye">
          <mesh position={[-0.034, 0, 0]} rotation={[0, 0, 0.15]} material={lensMat}>
            <planeGeometry args={[0.038, 0.022]} />
          </mesh>
          <mesh position={[0.034, 0, 0]} rotation={[0, 0, -0.15]} material={lensMat}>
            <planeGeometry args={[0.038, 0.022]} />
          </mesh>
        </group>
      )}

      {/* 4. BRACELET & RINGS (Articulated around left shoulder [-0.19, 1.34, 0]) */}
      {showBody && (bracelet !== "none" || ring !== "none") && (
        <group
          position={[-0.19, 1.34, 0]}
          rotation={poseConfig?.leftArmRot || [0, 0, 0]}
          name="wrist_hand_accessories"
        >
          {bracelet === "bangles" && (
            <group position={[-0.16, -0.52, 0.015]} name="bangles">
              <mesh rotation={[0, 0, Math.PI * 0.5]} material={metalMat} castShadow>
                <torusGeometry args={[0.028, 0.002, 16, 28]} />
              </mesh>
              <mesh position={[0, 0.008, 0]} rotation={[0, 0, Math.PI * 0.5]} material={metalMat} castShadow>
                <torusGeometry args={[0.028, 0.002, 16, 28]} />
              </mesh>
              <mesh position={[0, -0.008, 0]} rotation={[0, 0, Math.PI * 0.5]} material={metalMat} castShadow>
                <torusGeometry args={[0.028, 0.002, 16, 28]} />
              </mesh>
            </group>
          )}

          {bracelet === "tennisBracelet" && (
            <mesh position={[-0.16, -0.52, 0.015]} rotation={[0, 0, Math.PI * 0.5]} material={gemMat} castShadow>
              <torusGeometry args={[0.028, 0.0025, 16, 28]} />
            </mesh>
          )}

          {ring === "goldBand" && (
            <mesh position={[-0.19, -0.62, 0.02]} rotation={[0, 0, Math.PI * 0.5]} material={metalMat}>
              <torusGeometry args={[0.009, 0.0016, 12, 20]} />
            </mesh>
          )}

          {ring === "cocktailRing" && (
            <group position={[-0.19, -0.62, 0.02]} name="cocktail_ring">
              <mesh rotation={[0, 0, Math.PI * 0.5]} material={metalMat}>
                <torusGeometry args={[0.009, 0.0016, 12, 20]} />
              </mesh>
              <mesh position={[0.008, 0, 0]} material={gemMat}>
                <boxGeometry args={[0.006, 0.006, 0.006]} />
              </mesh>
            </group>
          )}
        </group>
      )}
    </group>
  );
}

