import { useMemo } from "react";
import * as THREE from "three";
import { getExpressionData } from "./Expressions.js";

/**
 * 3D Sculpted Nose Geometry with Morph Controls
 */
function createNoseGeometry(bridgeWidth = 0, tipProj = 0) {
  const geo = new THREE.BufferGeometry();
  const positions = [];
  const uvs = [];
  const indices = [];

  const bwScale = 1 + bridgeWidth * 0.25;
  const tpScale = 1 + tipProj * 0.3;

  const levels = [
    { y: 0.024,  z: 0.092, w: 0.007 * bwScale, proj: 0.004 },
    { y: 0.008,  z: 0.098, w: 0.008 * bwScale, proj: 0.008 },
    { y: -0.008, z: 0.108, w: 0.010,           proj: 0.014 * tpScale },
    { y: -0.016, z: 0.116, w: 0.015,           proj: 0.018 * tpScale },
    { y: -0.024, z: 0.098, w: 0.013,           proj: 0.008 }
  ];

  const radial = 10;
  for (let i = 0; i < levels.length; i++) {
    const lvl = levels[i];
    for (let j = 0; j <= radial; j++) {
      const u = j / radial;
      const angle = (u - 0.5) * Math.PI * 0.95;
      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);

      const px = sinA * lvl.w;
      const py = lvl.y;
      const pz = lvl.z + cosA * lvl.proj;

      positions.push(px, py, pz);
      uvs.push(u, i / (levels.length - 1));
    }
  }

  const cols = radial + 1;
  for (let i = 0; i < levels.length - 1; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * cols + j;
      const b = a + cols;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }

  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * 3D Sculpted Mouth & Lips Geometry with Expression and Fullness Morphs
 */
function createLipsGeometry(lipFullness = 0, expressionName = "neutral") {
  const expr = getExpressionData(expressionName);
  const geo = new THREE.BufferGeometry();
  const positions = [];
  const uvs = [];
  const indices = [];

  const numSlices = 16;
  const numRings = 5;

  const widthScale = 0.024 + expr.mouthWidth;
  const fullnessScale = 1 + lipFullness * 0.25;

  for (let r = 0; r < numRings; r++) {
    const ringT = r / (numRings - 1);
    for (let s = 0; s <= numSlices; s++) {
      const u = s / numSlices;
      const theta = (u - 0.5) * Math.PI;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);

      const px = sinT * widthScale;
      // Expression shifts mouth corners vertically (with subtle natural asymmetry on smirk)
      const cornerInfluence = Math.pow(Math.abs(sinT), 1.8);
      const sideBias = (expr.id === "playful" && sinT > 0) ? 1.45 : (expr.id === "playful" && sinT < 0 ? 0.65 : 1.0);
      const cornerLift = expr.mouthCornerY * cornerInfluence * sideBias;

      let py = -0.042 + cornerLift;
      let pz = 0.096 + cosT * 0.012;

      if (r === 0) {
        // Upper vermilion border with Cupid's bow
        const cupidBow = Math.abs(px) < 0.007 ? -Math.abs(px) * 0.35 + 0.002 : 0;
        py = -0.036 + cupidBow + expr.upperLipLift + cornerLift;
        pz = 0.098 + cosT * (0.009 * fullnessScale);
      } else if (r === 1) {
        py = -0.039 + expr.upperLipLift * 0.6 + cornerLift;
        pz = 0.103 + cosT * (0.008 * fullnessScale);
      } else if (r === 2) {
        py = -0.043 + cornerLift;
        pz = 0.099 + cosT * 0.006;
      } else if (r === 3) {
        py = -0.048 - expr.lowerLipDepress + cornerLift;
        pz = 0.103 + cosT * (0.009 * fullnessScale);
      } else {
        py = -0.053 - expr.lowerLipDepress + cornerLift;
        pz = 0.097 + cosT * 0.007;
      }

      positions.push(px, py, pz);
      uvs.push(u, ringT);
    }
  }

  const cols = numSlices + 1;
  for (let r = 0; r < numRings - 1; r++) {
    for (let s = 0; s < numSlices; s++) {
      const a = r * cols + s;
      const b = a + cols;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }

  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Anatomical Eyelids with Expression Squint / Relax
 */
function createEyelidsGeometry(isUpper = true, squint = 0) {
  const geo = new THREE.BufferGeometry();
  const positions = [];
  const uvs = [];
  const indices = [];

  const segments = 14;
  const rad = 0.0135;

  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const a = (u - 0.5) * Math.PI * 0.85;
    const cosA = Math.cos(a);
    const sinA = Math.sin(a);

    // Inner rim with squint modulation
    const squintY = isUpper ? -squint * 0.002 : squint * 0.002;
    const rimY = (isUpper ? Math.cos(a) * 0.005 : -Math.cos(a) * 0.004) + squintY;
    const rimZ = Math.sqrt(Math.max(0, rad * rad - sinA * sinA * rad * rad - rimY * rimY));
    positions.push(sinA * rad, rimY, rimZ);
    uvs.push(u, 0);

    const foldY = isUpper ? rimY + 0.0045 : rimY - 0.0035;
    const foldZ = rimZ - 0.003;
    positions.push(sinA * rad * 1.15, foldY, foldZ);
    uvs.push(u, 1);
  }

  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }

  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// Iris color tints
const IRIS_COLORS = {
  hazelGreen: new THREE.Color("#6b7344"),
  espressoBrown: new THREE.Color("#3d281a"),
  honeyAmber: new THREE.Color("#855d34"),
  deepBlue: new THREE.Color("#34587c"),
  slateGray: new THREE.Color("#56626e")
};

function AnatomicalEye({ position, mats, isLeft = true, eyesState = {}, expressionName = "neutral" }) {
  const expr = getExpressionData(expressionName);
  const squint = expr.eyeSquint || 0;

  const upperEyelidGeo = useMemo(() => createEyelidsGeometry(true, squint), [squint]);
  const lowerEyelidGeo = useMemo(() => createEyelidsGeometry(false, squint), [squint]);

  // Gaze direction + expression bias
  const gazeX = (eyesState.gazeX || 0) + (expr.gazeBias ? expr.gazeBias[0] : 0);
  const gazeY = (eyesState.gazeY || 0) + (expr.gazeBias ? expr.gazeBias[1] : 0);

  const rotY = (isLeft ? 0.04 : -0.04) + gazeX * 0.45;
  const rotX = -gazeY * 0.35;

  const pupilScale = (eyesState.pupilSize || 0.32) / 0.32;
  const irisCol = IRIS_COLORS[eyesState.irisColor] || IRIS_COLORS.hazelGreen;

  const irisMat = useMemo(() => {
    const m = mats.eyeIris.clone();
    m.color = irisCol;
    return m;
  }, [mats.eyeIris, irisCol]);

  return (
    <group position={position} rotation={[rotX, rotY, 0]}>
      {/* 1. Sclera (Eyeball Sphere) */}
      <mesh material={mats.eyeSclera} castShadow={false}>
        <sphereGeometry args={[0.0125, 32, 24]} />
      </mesh>

      {/* 2. Inset Iris Disc */}
      <mesh position={[0, 0, 0.0105]} material={irisMat} scale={[pupilScale, pupilScale, 1]}>
        <circleGeometry args={[0.0068, 32]} />
      </mesh>

      {/* 3. Cornea Lens (Wet clearcoat dome) */}
      <mesh position={[0, 0, 0.0065]} material={mats.eyeCornea}>
        <sphereGeometry args={[0.0078, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
      </mesh>

      {/* 4. Contoured Eyelids */}
      <mesh geometry={upperEyelidGeo} material={mats.face} position={[0, 0, 0.001]} />
      <mesh geometry={lowerEyelidGeo} material={mats.face} position={[0, 0, 0.001]} />
    </group>
  );
}

// Eyebrow geometry with natural arch and expression movement
function createEyebrowGeometry(isLeft = true, browLift = 0, browTilt = 0) {
  const sideSign = isLeft ? -1 : 1;
  const geo = new THREE.BufferGeometry();
  const positions = [];
  const uvs = [];
  const indices = [];

  const points = [
    new THREE.Vector3(sideSign * 0.016, 0.036 + browLift - browTilt * 0.006, 0.093),
    new THREE.Vector3(sideSign * 0.026, 0.040 + browLift + browTilt * 0.005, 0.091),
    new THREE.Vector3(sideSign * 0.038, 0.042 + browLift + browTilt * 0.014, 0.086),
    new THREE.Vector3(sideSign * 0.052, 0.034 + browLift + browTilt * 0.006, 0.075)
  ];

  const curve = new THREE.CatmullRomCurve3(points);
  const segments = 12;
  const width = 0.0032;

  for (let i = 0; i <= segments; i++) {
    const u = i / segments;
    const pt = curve.getPointAt(u);
    const w = width * Math.sin(u * Math.PI) * (1 - u * 0.35);

    positions.push(pt.x, pt.y + w, pt.z + 0.001);
    positions.push(pt.x, pt.y - w, pt.z + 0.001);
    uvs.push(u, 1, u, 0);

    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }

  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// Lipstick finish shades
const LIP_COLORS = {
  natural: "#b05e62",
  gloss: "#be555c",
  crimson: "#9c1825",
  wine: "#6a1523",
  rose: "#c96872"
};

export default function FaceFeatures({
  mats,
  faceMorphs = {},
  expression = "neutral",
  eyes = {},
  beauty = {}
}) {
  const exprData = getExpressionData(expression);
  const browLift = exprData.browLift || 0;
  const browTilt = exprData.browTilt || 0;

  const browLeftGeo = useMemo(() => createEyebrowGeometry(true, browLift, browTilt), [browLift, browTilt]);
  const browRightGeo = useMemo(() => createEyebrowGeometry(false, browLift, browTilt), [browLift, browTilt]);

  const browMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#241712",
      roughness: 0.85,
      metalness: 0.04,
      side: THREE.DoubleSide
    });
  }, []);

  const noseGeo = useMemo(
    () => createNoseGeometry(faceMorphs.noseBridge || 0, faceMorphs.noseTip || 0),
    [faceMorphs.noseBridge, faceMorphs.noseTip]
  );

  const lipsGeo = useMemo(
    () => createLipsGeometry(faceMorphs.lipFullness || 0, expression),
    [faceMorphs.lipFullness, expression]
  );

  const lipHex = LIP_COLORS[beauty.lipstick] || LIP_COLORS.natural;

  const lipMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: lipHex,
      roughness: beauty.lipstick === "gloss" ? 0.16 : 0.28,
      clearcoat: beauty.lipstick === "gloss" ? 0.85 : 0.45,
      clearcoatRoughness: 0.12,
      sheen: 0.65,
      sheenColor: new THREE.Color("#d47c82")
    });
  }, [lipHex, beauty.lipstick]);

  // Eye spacing adjustment
  const eyeOffset = 0.034 + (faceMorphs.eyeSpacing || 0) * 0.006;

  return (
    <group name="face_features">
      {/* Left Eye */}
      <AnatomicalEye
        position={[-eyeOffset, 0.016, 0.088]}
        mats={mats}
        isLeft={true}
        eyesState={eyes}
        expressionName={expression}
      />

      {/* Right Eye */}
      <AnatomicalEye
        position={[eyeOffset, 0.016, 0.088]}
        mats={mats}
        isLeft={false}
        eyesState={eyes}
        expressionName={expression}
      />

      {/* Natural Eyebrow Arches */}
      <mesh geometry={browLeftGeo} material={browMaterial} />
      <mesh geometry={browRightGeo} material={browMaterial} />

      {/* 3D Sculpted Nose Structure */}
      <mesh geometry={noseGeo} material={mats.face} castShadow />

      {/* 3D Sculpted Lips Structure */}
      <mesh geometry={lipsGeo} material={lipMaterial} castShadow />
    </group>
  );
}

