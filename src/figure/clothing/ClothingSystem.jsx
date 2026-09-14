import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { createOffsetGarmentShell } from "../morphs/MorphSystem.js";

/**
 * Fabric Physical Material Profiles
 */
export const FABRIC_PROFILES = {
  cotton: { roughness: 0.76, sheen: 0.25, sheenColor: "#ffffff", clearcoat: 0, transmission: 0 },
  silk: { roughness: 0.28, sheen: 0.85, sheenColor: "#ffecd9", clearcoat: 0.35, clearcoatRoughness: 0.2, transmission: 0 },
  satin: { roughness: 0.22, sheen: 0.90, sheenColor: "#ffd6de", clearcoat: 0.45, clearcoatRoughness: 0.15, transmission: 0 },
  denim: { roughness: 0.72, sheen: 0.15, sheenColor: "#8faec7", clearcoat: 0, transmission: 0 },
  wool: { roughness: 0.88, sheen: 0.55, sheenColor: "#e0d8cc", clearcoat: 0, transmission: 0 },
  linen: { roughness: 0.82, sheen: 0.20, sheenColor: "#ffffff", clearcoat: 0, transmission: 0 },
  chiffon: { roughness: 0.35, sheen: 0.65, sheenColor: "#ffffff", clearcoat: 0.2, transmission: 0.45, transparent: true, opacity: 0.85 },
  velvet: { roughness: 0.55, sheen: 1.0, sheenColor: "#ffffff", clearcoat: 0.15, transmission: 0 },
  leather: { roughness: 0.32, sheen: 0.3, sheenColor: "#555555", clearcoat: 0.5, clearcoatRoughness: 0.3, transmission: 0 }
};

export const COLOR_THEMES = {
  noir: "#18181a",
  champagne: "#e2d5c3",
  emerald: "#1b3a2b",
  crimson: "#7a1a24",
  terracotta: "#a3543b",
  blush: "#c98f8c"
};

function getGarmentMaterial(baseMat, baseColor, fabricType = "cotton", colorTheme = "default") {
  const profile = FABRIC_PROFILES[fabricType] || FABRIC_PROFILES.cotton;
  const color = colorTheme !== "default" && COLOR_THEMES[colorTheme] ? COLOR_THEMES[colorTheme] : baseColor;

  const m = baseMat.clone();
  m.color = new THREE.Color(color);
  m.roughness = profile.roughness;
  m.sheen = profile.sheen;
  m.sheenColor = new THREE.Color(profile.sheenColor);
  m.clearcoat = profile.clearcoat || 0;
  m.clearcoatRoughness = profile.clearcoatRoughness || 0;
  if (profile.transmission) {
    m.transmission = profile.transmission;
    m.transparent = profile.transparent || false;
    m.opacity = profile.opacity || 1.0;
  }
  m.side = THREE.DoubleSide;
  return m;
}

/**
 * Shoes System (High heels, slides, sandals, boots) with kinematic pose tracking
 */
function ShoePair({ type = "slides", mats, color = "#1a1618", poseConfig = null }) {
  const shoeMat = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.28,
      clearcoat: 0.6,
      clearcoatRoughness: 0.2,
      side: THREE.DoubleSide
    });
  }, [color]);

  if (type === "none") return null;

  const leftLegRot = poseConfig?.leftLegRot || [0, 0, 0];
  const leftLegOffset = poseConfig?.leftLegOffset || [0, 0, 0];
  const rightLegRot = poseConfig?.rightLegRot || [0, 0, 0];
  const rightLegOffset = poseConfig?.rightLegOffset || [0, 0, 0];

  return (
    <group name={`shoes_${type}`}>
      {/* Left Shoe (articulated around left hip [-0.076, 0.78, 0]) */}
      <group
        position={[-0.076 + leftLegOffset[0], 0.78 + leftLegOffset[1], leftLegOffset[2]]}
        rotation={leftLegRot}
      >
        <group position={[0, -0.742, 0.03]}>
          {type === "stilettos" && (
            <group>
              {/* Sole */}
              <mesh position={[0, -0.015, 0.01]} material={shoeMat} castShadow>
                <boxGeometry args={[0.048, 0.008, 0.12]} />
              </mesh>
              {/* Vamp / Toe strap */}
              <mesh position={[0, -0.004, 0.045]} material={shoeMat} castShadow>
                <cylinderGeometry args={[0.026, 0.026, 0.018, 16, 1, false, 0, Math.PI]} />
              </mesh>
              {/* Stiletto Heel Column */}
              <mesh position={[0, -0.042, -0.038]} material={shoeMat} castShadow>
                <cylinderGeometry args={[0.004, 0.002, 0.055, 12]} />
              </mesh>
            </group>
          )}

          {type === "slides" && (
            <group>
              <mesh position={[0, -0.018, 0.01]} material={shoeMat} castShadow>
                <boxGeometry args={[0.052, 0.012, 0.13]} />
              </mesh>
              <mesh position={[0, -0.002, 0.02]} rotation={[0.2, 0, 0]} material={shoeMat} castShadow>
                <cylinderGeometry args={[0.028, 0.028, 0.038, 16, 1, false, 0, Math.PI]} />
              </mesh>
            </group>
          )}

          {type === "sandals" && (
            <group>
              <mesh position={[0, -0.018, 0.01]} material={shoeMat} castShadow>
                <boxGeometry args={[0.050, 0.008, 0.13]} />
              </mesh>
              {/* Ankle wrap strap */}
              <mesh position={[0, 0.03, 0]} rotation={[0, 0, Math.PI * 0.5]} material={shoeMat}>
                <torusGeometry args={[0.028, 0.002, 12, 24]} />
              </mesh>
            </group>
          )}

          {type === "ankleBoots" && (
            <group>
              <mesh position={[0, -0.014, 0.01]} material={shoeMat} castShadow>
                <boxGeometry args={[0.052, 0.014, 0.13]} />
              </mesh>
              <mesh position={[0, 0.04, 0]} material={shoeMat} castShadow>
                <cylinderGeometry args={[0.034, 0.038, 0.10, 18]} />
              </mesh>
            </group>
          )}
        </group>
      </group>

      {/* Right Shoe (articulated around right hip [0.076, 0.78, 0]) */}
      <group
        position={[0.076 + rightLegOffset[0], 0.78 + rightLegOffset[1], rightLegOffset[2]]}
        rotation={rightLegRot}
      >
        <group position={[0, -0.742, 0.03]}>
          {type === "stilettos" && (
            <group>
              <mesh position={[0, -0.015, 0.01]} material={shoeMat} castShadow>
                <boxGeometry args={[0.048, 0.008, 0.12]} />
              </mesh>
              <mesh position={[0, -0.004, 0.045]} material={shoeMat} castShadow>
                <cylinderGeometry args={[0.026, 0.026, 0.018, 16, 1, false, 0, Math.PI]} />
              </mesh>
              <mesh position={[0, -0.042, -0.038]} material={shoeMat} castShadow>
                <cylinderGeometry args={[0.004, 0.002, 0.055, 12]} />
              </mesh>
            </group>
          )}

          {type === "slides" && (
            <group>
              <mesh position={[0, -0.018, 0.01]} material={shoeMat} castShadow>
                <boxGeometry args={[0.052, 0.012, 0.13]} />
              </mesh>
              <mesh position={[0, -0.002, 0.02]} rotation={[0.2, 0, 0]} material={shoeMat} castShadow>
                <cylinderGeometry args={[0.028, 0.028, 0.038, 16, 1, false, 0, Math.PI]} />
              </mesh>
            </group>
          )}

          {type === "sandals" && (
            <group>
              <mesh position={[0, -0.018, 0.01]} material={shoeMat} castShadow>
                <boxGeometry args={[0.050, 0.008, 0.13]} />
              </mesh>
              <mesh position={[0, 0.03, 0]} rotation={[0, 0, Math.PI * 0.5]} material={shoeMat}>
                <torusGeometry args={[0.028, 0.002, 12, 24]} />
              </mesh>
            </group>
          )}

          {type === "ankleBoots" && (
            <group>
              <mesh position={[0, -0.014, 0.01]} material={shoeMat} castShadow>
                <boxGeometry args={[0.052, 0.014, 0.13]} />
              </mesh>
              <mesh position={[0, 0.04, 0]} material={shoeMat} castShadow>
                <cylinderGeometry args={[0.034, 0.038, 0.10, 18]} />
              </mesh>
            </group>
          )}
        </group>
      </group>
    </group>
  );
}

/**
 * Tailored Wardrobe System for Solenne
 * Full mix-and-match fashion matrix: Tops, Bottoms, Dresses, Traditional/Kurta, Outerwear, Shoes, PBR Fabrics
 */
export default function ClothingSystem({ bodyGeo, wardrobe = {}, outfit = {}, mats, poseConfig = null }) {
  const fabricType = wardrobe.fabricType || "cotton";
  const colorTheme = wardrobe.colorTheme || "default";

  // Derive active items
  const activeTop = wardrobe.top || (outfit.casual ? "cropTank" : "none");
  const activeBottom = wardrobe.bottom || (outfit.casual ? "denimShorts" : "none");
  const activeDress = wardrobe.dress || (outfit.dress ? "satinSlip" : "none");
  const activeOuterwear = wardrobe.outerwear || (outfit.robe ? "robe" : "none");
  const activeShoes = wardrobe.shoes || "slides";

  // Is character in underwear / lingerie mode?
  const isNoneLook = !outfit.casual && !outfit.dress && activeTop === "none" && activeBottom === "none" && activeDress === "none";
  const isLingerie = outfit.lingerie;

  // Tailored Garment Geometries derived synchronously from anatomical body
  const geos = useMemo(() => {
    if (!bodyGeo) return null;

    // Base Underwear & Lingerie
    const neutralTop = createOffsetGarmentShell(bodyGeo, 0.0045, 0.58, 0.78, { extraFront: 0.003 });
    const neutralBot = createOffsetGarmentShell(bodyGeo, 0.0045, 0.04, 0.25);
    const lingerieTop = createOffsetGarmentShell(bodyGeo, 0.006, 0.57, 0.80, { extraFront: 0.004 });
    const lingerieBot = createOffsetGarmentShell(bodyGeo, 0.006, 0.03, 0.28);

    // Tops
    const cropTank = createOffsetGarmentShell(bodyGeo, 0.009, 0.50, 0.85, { extraFront: 0.006 });
    const blouse = createOffsetGarmentShell(bodyGeo, 0.012, 0.46, 0.87, { extraFront: 0.008, flare: 0.04 });
    const kurta = createOffsetGarmentShell(bodyGeo, 0.015, 0.20, 0.88, { extraFront: 0.009, flare: 0.06 });
    const blazer = createOffsetGarmentShell(bodyGeo, 0.018, 0.44, 0.89, { extraFront: 0.012, flare: 0.05 });
    const sweater = createOffsetGarmentShell(bodyGeo, 0.016, 0.42, 0.88, { extraFront: 0.008 });

    // Bottoms
    const denimShorts = createOffsetGarmentShell(bodyGeo, 0.011, 0.06, 0.42);
    const trousers = createOffsetGarmentShell(bodyGeo, 0.013, 0.02, 0.44, { flare: 0.02 });
    const wideLegPants = createOffsetGarmentShell(bodyGeo, 0.016, 0.02, 0.45, { flare: 0.08 });
    const midiSkirt = createOffsetGarmentShell(bodyGeo, 0.015, 0.02, 0.42, { flare: 0.12 });

    // Dresses
    const satinSlip = createOffsetGarmentShell(bodyGeo, 0.014, 0.10, 0.84, { extraFront: 0.008, flare: 0.075 });
    const eveningGown = createOffsetGarmentShell(bodyGeo, 0.015, 0.02, 0.86, { extraFront: 0.008, flare: 0.09 });
    const sundress = createOffsetGarmentShell(bodyGeo, 0.016, 0.14, 0.82, { extraFront: 0.007, flare: 0.14 });
    const midiDress = createOffsetGarmentShell(bodyGeo, 0.014, 0.04, 0.85, { extraFront: 0.008, flare: 0.08 });

    // Outerwear
    const robe = createOffsetGarmentShell(bodyGeo, 0.022, 0.04, 0.89, { extraFront: 0.014, flare: 0.12 });
    const shawl = createOffsetGarmentShell(bodyGeo, 0.020, 0.54, 0.88, { extraFront: 0.012, flare: 0.08 });
    const coat = createOffsetGarmentShell(bodyGeo, 0.024, 0.06, 0.90, { extraFront: 0.016, flare: 0.10 });

    return {
      neutralTop,
      neutralBot,
      lingerieTop,
      lingerieBot,
      cropTank,
      blouse,
      kurta,
      blazer,
      sweater,
      denimShorts,
      trousers,
      wideLegPants,
      midiSkirt,
      satinSlip,
      eveningGown,
      sundress,
      midiDress,
      robe,
      shawl,
      coat
    };
  }, [bodyGeo]);

  // Clean up GPU buffer geometries and materials on unmount/recreation
  useLayoutEffect(() => {
    return () => {
      if (geos) {
        Object.values(geos).forEach((g) => g?.dispose());
      }
    };
  }, [geos]);

  useLayoutEffect(() => {
    return () => {
      topMat?.dispose();
      bottomMat?.dispose();
      dressMat?.dispose();
      robeMat?.dispose();
      blazerMat?.dispose();
      traditionalMat?.dispose();
    };
  }, [topMat, bottomMat, dressMat, robeMat, blazerMat, traditionalMat]);

  if (!geos) return null;

  return (
    <group name="clothing_system">
      {/* 1. UNDERWEAR / LINGERIE BASE */}
      {isNoneLook && !isLingerie && (
        <group name="look_none">
          <mesh geometry={geos.neutralTop} material={mats.neutralUnderwear} name="neutralTop" castShadow />
          <mesh geometry={geos.neutralBot} material={mats.neutralUnderwear} name="neutralBot" castShadow />
        </group>
      )}

      {isLingerie && (
        <group name="look_lingerie">
          <mesh geometry={geos.lingerieTop} material={mats.lingerie} name="lingerieTop" castShadow />
          <mesh geometry={geos.lingerieBot} material={mats.lingerie} name="lingerieBot" castShadow />
        </group>
      )}

      {/* 2. DRESSES (mutually exclusive with tops/bottoms) */}
      {activeDress === "satinSlip" && <mesh geometry={geos.satinSlip} material={dressMat} name="dress_satinSlip" castShadow />}
      {activeDress === "eveningGown" && <mesh geometry={geos.eveningGown} material={dressMat} name="dress_eveningGown" castShadow />}
      {activeDress === "sundress" && <mesh geometry={geos.sundress} material={dressMat} name="dress_sundress" castShadow />}
      {activeDress === "midiDress" && <mesh geometry={geos.midiDress} material={dressMat} name="dress_midiDress" castShadow />}

      {/* 3. TOPS (active when dress is none) */}
      {activeDress === "none" && (
        <group name="tops_layer">
          {activeTop === "cropTank" && <mesh geometry={geos.cropTank} material={topMat} name="top_cropTank" castShadow />}
          {activeTop === "blouse" && <mesh geometry={geos.blouse} material={topMat} name="top_blouse" castShadow />}
          {activeTop === "kurta" && <mesh geometry={geos.kurta} material={traditionalMat} name="top_kurta" castShadow />}
          {activeTop === "blazer" && <mesh geometry={geos.blazer} material={blazerMat} name="top_blazer" castShadow />}
          {activeTop === "sweater" && <mesh geometry={geos.sweater} material={topMat} name="top_sweater" castShadow />}
        </group>
      )}

      {/* 4. BOTTOMS (active when dress is none) */}
      {activeDress === "none" && (
        <group name="bottoms_layer">
          {activeBottom === "denimShorts" && <mesh geometry={geos.denimShorts} material={bottomMat} name="bottom_denimShorts" castShadow />}
          {activeBottom === "trousers" && <mesh geometry={geos.trousers} material={blazerMat} name="bottom_trousers" castShadow />}
          {activeBottom === "wideLegPants" && <mesh geometry={geos.wideLegPants} material={topMat} name="bottom_wideLegPants" castShadow />}
          {activeBottom === "midiSkirt" && <mesh geometry={geos.midiSkirt} material={dressMat} name="bottom_midiSkirt" castShadow />}
        </group>
      )}

      {/* 5. OUTERWEAR */}
      {activeOuterwear === "robe" && <mesh geometry={geos.robe} material={robeMat} name="outerwear_robe" castShadow />}
      {activeOuterwear === "shawl" && <mesh geometry={geos.shawl} material={traditionalMat} name="outerwear_shawl" castShadow />}
      {activeOuterwear === "coat" && <mesh geometry={geos.coat} material={blazerMat} name="outerwear_coat" castShadow />}
      {activeOuterwear === "blazer" && <mesh geometry={geos.blazer} material={blazerMat} name="outerwear_blazer" castShadow />}

      {/* 6. SHOES */}
      <ShoePair type={activeShoes} mats={mats} poseConfig={poseConfig} />
    </group>
  );
}
