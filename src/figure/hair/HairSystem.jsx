import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import {
  getReferenceWaves,
  getStraightHair,
  getCurlsHair,
  getHalfUpHair,
  getPonytailHair,
  getBunHair
} from "./hairStyles.js";

/**
 * Hair colors matching the Solenne natural palette
 */
export const HAIR_COLORS = {
  darkChestnut: { color: "#2a1a12", sheenColor: "#6b442e" },
  espressoBlack: { color: "#141112", sheenColor: "#322b2d" },
  chocolate: { color: "#352018", sheenColor: "#7a4b35" },
  warmChestnut: { color: "#422518", sheenColor: "#9c5737" },
  honeyHighlights: { color: "#4e3220", sheenColor: "#b87c47" }
};

const STYLE_GENERATORS = {
  waves: getReferenceWaves,
  straight: getStraightHair,
  curls: getCurlsHair,
  halfUp: getHalfUpHair,
  ponytail: getPonytailHair,
  bun: getBunHair
};

/**
 * Creates the scalp volume base with center part indentation
 */
function createScalpBase() {
  const geo = new THREE.SphereGeometry(0.116, 36, 24, 0, Math.PI * 2, 0, Math.PI * 0.58);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Conform closely to cranium
    y *= 1.16;
    z *= 1.08;

    // Center part indentation at crown (x ≈ 0, y > 0.04)
    if (Math.abs(x) < 0.012 && y > 0.03 && z > -0.06) {
      y -= 0.005;
    }

    // Natural hairline rise in front (forehead exposure)
    if (z > 0.06 && y > 0.02) {
      y += 0.010;
    }

    pos.setXYZ(i, x, y, z);
  }
  geo.computeVertexNormals();
  return geo;
}

export default function HairSystem({ mats, hairState = {} }) {
  const scalpGeo = useMemo(() => createScalpBase(), []);

  const styleKey = hairState.style || "waves";
  const colorKey = hairState.color || "darkChestnut";

  // Dynamic hair material according to color palette
  const hairMaterial = useMemo(() => {
    const pal = HAIR_COLORS[colorKey] || HAIR_COLORS.darkChestnut;
    const m = mats.hair.clone();
    m.color = new THREE.Color(pal.color);
    m.sheenColor = new THREE.Color(pal.sheenColor);
    return m;
  }, [mats.hair, colorKey]);

  // Construct hairstyle geometry ribbons
  const hairLockGeometries = useMemo(() => {
    const generator = STYLE_GENERATORS[styleKey] || getReferenceWaves;
    return generator();
  }, [styleKey]);

  // Clean up GPU buffer geometries and materials on unmount/recreation
  useLayoutEffect(() => {
    return () => {
      hairLockGeometries.forEach((g) => g?.dispose());
    };
  }, [hairLockGeometries]);

  useLayoutEffect(() => {
    return () => {
      scalpGeo?.dispose();
    };
  }, [scalpGeo]);

  useLayoutEffect(() => {
    return () => {
      hairMaterial?.dispose();
    };
  }, [hairMaterial]);

  return (
    <group name="hair_system">
      {/* 1. Scalp Volume Base */}
      <mesh geometry={scalpGeo} material={hairMaterial} castShadow />

      {/* 2. Volumetric Hairstyle Ribbon Locks */}
      {hairLockGeometries.map((geo, idx) => (
        <mesh key={`${styleKey}_${idx}`} geometry={geo} material={hairMaterial} castShadow />
      ))}
    </group>
  );
}

