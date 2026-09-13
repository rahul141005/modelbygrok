import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { createBodyGeometry, createHead, createLimb, createOffsetShell, createSkirtShell, morphAll } from "./geometry.js";
import { makeHair } from "./hair.js";
import { getMaterials, applyFaceMap } from "./materials.js";
import { useViewer } from "../state.jsx";

function FaceFeatures({ mats }) {
  return (
    <group position={[0, 0.01, 0.09]}>
      <mesh position={[-0.032, 0.018, 0.012]} material={mats.eyeWhite}>
        <sphereGeometry args={[0.013, 16, 12]} />
      </mesh>
      <mesh position={[0.032, 0.018, 0.012]} material={mats.eyeWhite}>
        <sphereGeometry args={[0.013, 16, 12]} />
      </mesh>
      <mesh position={[-0.032, 0.018, 0.022]} material={mats.iris}>
        <sphereGeometry args={[0.007, 12, 10]} />
      </mesh>
      <mesh position={[0.032, 0.018, 0.022]} material={mats.iris}>
        <sphereGeometry args={[0.007, 12, 10]} />
      </mesh>
      <mesh position={[-0.032, 0.018, 0.027]} material={mats.pupil}>
        <sphereGeometry args={[0.0032, 10, 8]} />
      </mesh>
      <mesh position={[0.032, 0.018, 0.027]} material={mats.pupil}>
        <sphereGeometry args={[0.0032, 10, 8]} />
      </mesh>
      <mesh position={[-0.032, 0.038, 0.01]} rotation={[0, 0, 0.18]} material={mats.brow}>
        <boxGeometry args={[0.034, 0.004, 0.006]} />
      </mesh>
      <mesh position={[0.032, 0.038, 0.01]} rotation={[0, 0, -0.18]} material={mats.brow}>
        <boxGeometry args={[0.034, 0.004, 0.006]} />
      </mesh>
      <mesh position={[0, -0.012, 0.028]} material={mats.skin}>
        <sphereGeometry args={[0.012, 12, 10]} />
      </mesh>
      <mesh position={[0, -0.038, 0.03]} material={mats.lip}>
        <sphereGeometry args={[0.016, 12, 8]} />
      </mesh>
    </group>
  );
}

function LoadingPlaceholder() {
  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "var(--muted)",
      fontSize: 12,
      letterSpacing: "0.08em",
      textTransform: "uppercase"
    }}>
      Initializing viewer...
    </div>
  );
}

export default function Woman() {
  const { bust, hips, outfit, faceTexture, clothed } = useViewer();
  const root = useRef();
  const [ready, setReady] = useState(false);

  const mats = useMemo(() => getMaterials(), []);

  const hair = useMemo(() => makeHair(), []);

  const geos = useMemo(() => {
    const body = createBodyGeometry(1.58, 48, 80);
    const head = createHead();
    const arm = createLimb(0.038, 0.026, 0.58, 16, 12, 0, 0.12);
    const thigh = createLimb(0.062, 0.046, 0.42, 18, 10, 0.55, 0);
    const calf = createLimb(0.04, 0.03, 0.4, 16, 10, 0.08, 0);
    const lingerieTop = createOffsetShell(body, 0.006, 0.7, 0.84, 0.01);
    const lingerieBot = createOffsetShell(body, 0.007, 0.5, 0.6, 0.004);
    const casualTop = createOffsetShell(body, 0.012, 0.66, 0.88, 0.008);
    const casualBot = createOffsetShell(body, 0.014, 0.28, 0.62, 0.006);
    const dressGeo = createSkirtShell(body, 0.016, 0.12, 0.88, 0.11);
    const robeGeo = createSkirtShell(body, 0.028, 0.08, 0.9, 0.16);
    setReady(true);
    return { body, head, arm, thigh, calf, lingerieTop, lingerieBot, casualTop, casualBot, dressGeo, robeGeo };
  }, []);

  useLayoutEffect(() => {
    if (root.current) morphAll(root.current, bust, hips);
  }, [bust, hips, geos]);

  useLayoutEffect(() => {
    applyFaceMap(clothed ? faceTexture : null);
  }, [faceTexture, clothed]);

  if (!ready) return <LoadingPlaceholder />;

  return (
    <group ref={root} position={[0, 0.02, 0]}>
      <mesh geometry={geos.body} material={mats.skin} castShadow receiveShadow name="body" />

      <group position={[0, 1.58, 0]}>
        <mesh geometry={geos.head} material={mats.face} castShadow name="head" />
        <FaceFeatures mats={mats} />
        <primitive object={hair} position={[0, 0.02, -0.01]} />
      </group>

      <mesh geometry={geos.arm} material={mats.skin} position={[-0.2, 1.22, 0]} rotation={[0, 0, 0.18]} castShadow />
      <mesh geometry={geos.arm} material={mats.skin} position={[0.2, 1.22, 0]} rotation={[0, 0, -0.18]} castShadow />
      <mesh geometry={geos.thigh} material={mats.skin} position={[-0.075, 0.68, 0]} castShadow />
      <mesh geometry={geos.thigh} material={mats.skin} position={[0.075, 0.68, 0]} castShadow />
      <mesh geometry={geos.calf} material={mats.skin} position={[-0.075, 0.28, 0]} castShadow />
      <mesh geometry={geos.calf} material={mats.skin} position={[0.075, 0.28, 0]} castShadow />
      <mesh material={mats.skin} position={[-0.075, 0.045, 0.03]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.07, 0.04, 0.16]} />
      </mesh>
      <mesh material={mats.skin} position={[0.075, 0.045, 0.03]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.07, 0.04, 0.16]} />
      </mesh>
      <mesh material={mats.nail} position={[-0.075, 0.04, 0.11]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.068, 0.012, 0.03]} />
      </mesh>
      <mesh material={mats.nail} position={[0.075, 0.04, 0.11]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.068, 0.012, 0.03]} />
      </mesh>

      <group visible={outfit.lingerie}>
        <mesh geometry={geos.lingerieTop} material={mats.lingerie} name="lingerieTop" castShadow />
        <mesh geometry={geos.lingerieBot} material={mats.lingerie} name="lingerieBot" castShadow />
      </group>
      <group visible={outfit.casual}>
        <mesh geometry={geos.casualTop} material={mats.casualTop} name="casualTop" castShadow />
        <mesh geometry={geos.casualBot} material={mats.casualBottom} name="casualBot" castShadow />
      </group>
      <mesh geometry={geos.dressGeo} material={mats.dress} visible={outfit.dress} name="dress" castShadow />
      <mesh geometry={geos.robeGeo} material={mats.robe} visible={outfit.robe} name="robe" castShadow />
    </group>
  );
}
