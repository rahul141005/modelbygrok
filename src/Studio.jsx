import { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import Woman from "./figure/Woman.jsx";
import { HERO_VIEWS } from "./bible.js";
import { useViewer } from "./state.jsx";
import {
  LIGHTING_PRESETS,
  STUDIO_BACKDROPS,
  CAMERA_PRESETS
} from "./presets/lightingPresets.js";

function StudioCamera() {
  const { heroView, cameraPreset } = useViewer();
  const { camera } = useThree();
  const controls = useRef();

  useEffect(() => {
    const p =
      CAMERA_PRESETS[cameraPreset] ||
      (HERO_VIEWS[heroView]
        ? {
            position: HERO_VIEWS[heroView].position,
            target: HERO_VIEWS[heroView].target,
            fov: 32
          }
        : CAMERA_PRESETS.studio);

    camera.position.set(...p.position);
    if (p.fov && camera.fov !== p.fov) {
      camera.fov = p.fov;
      camera.updateProjectionMatrix();
    }
    controls.current?.target.set(...p.target);
    controls.current?.update();
  }, [cameraPreset, heroView, camera]);

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      minDistance={0.8}
      maxDistance={7}
      minPolarAngle={0.2}
      maxPolarAngle={1.65}
      target={[0, 0.92, 0]}
    />
  );
}

function StudioLights() {
  const { lightingPreset } = useViewer();
  const cfg = LIGHTING_PRESETS[lightingPreset] || LIGHTING_PRESETS.softStudio;

  return (
    <>
      <hemisphereLight args={[cfg.ambient.color, cfg.ambient.ground, cfg.ambient.intensity]} />
      <directionalLight
        position={cfg.keyLight.position}
        intensity={cfg.keyLight.intensity}
        color={cfg.keyLight.color}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-2.5}
        shadow-camera-right={2.5}
        shadow-camera-top={3}
        shadow-camera-bottom={-0.5}
      />
      <directionalLight
        position={cfg.fillLight.position}
        intensity={cfg.fillLight.intensity}
        color={cfg.fillLight.color}
      />
      <directionalLight
        position={cfg.rimLight.position}
        intensity={cfg.rimLight.intensity}
        color={cfg.rimLight.color}
      />
      <spotLight
        position={cfg.spotLight.position}
        angle={0.5}
        penumbra={0.8}
        intensity={cfg.spotLight.intensity}
        color={cfg.spotLight.color}
      />
      <Environment preset="studio" environmentIntensity={cfg.envIntensity || 0.35} />
    </>
  );
}

function StudioStage() {
  const { backdrop } = useViewer();
  const bd = STUDIO_BACKDROPS[backdrop] || STUDIO_BACKDROPS.dark;

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial color={bd.ground} roughness={0.92} />
      </mesh>
      <mesh position={[0, 2.4, -3.4]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color={bd.hex} roughness={1} />
      </mesh>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.45} scale={8} blur={2.2} far={3.5} />
    </>
  );
}

function StudioCanvas() {
  const { backdrop } = useViewer();
  const bd = STUDIO_BACKDROPS[backdrop] || STUDIO_BACKDROPS.dark;

  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, toneMappingExposure: 1.12 }}
      camera={{ position: [0, 1.05, 3.35], fov: 32, near: 0.1, far: 40 }}
    >
      <color attach="background" args={[bd.hex]} />
      <StudioLights />
      <StudioStage />
      <Woman />
      <StudioCamera />
    </Canvas>
  );
}

export default function Studio() {
  return <StudioCanvas />;
}
