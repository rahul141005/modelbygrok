import { useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import Woman from "./figure/Woman.jsx";
import { HERO_VIEWS } from "./bible.js";
import { useViewer } from "./state.jsx";

function HeroCamera() {
  const { heroView } = useViewer();
  const { camera } = useThree();
  const controls = useRef();

  useEffect(() => {
    const v = HERO_VIEWS[heroView] || HERO_VIEWS.front;
    camera.position.set(...v.position);
    controls.current?.target.set(...v.target);
    controls.current?.update();
  }, [heroView, camera]);

  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      minDistance={1.4}
      maxDistance={6}
      minPolarAngle={0.4}
      maxPolarAngle={1.55}
      target={[0, 0.92, 0]}
    />
  );
}

function Lights() {
  return (
    <>
      <hemisphereLight args={["#f2ebe0", "#3d342c", 0.55]} />
      <directionalLight
        position={[-2.4, 3.6, 3.2]}
        intensity={2.1}
        color="#fff4e8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={12}
        shadow-camera-left={-2.5}
        shadow-camera-right={2.5}
        shadow-camera-top={3}
        shadow-camera-bottom={-0.5}
      />
      <directionalLight position={[3.2, 2.2, 1.2]} intensity={0.55} color="#c8d6ea" />
      <directionalLight position={[0.2, 2.8, -3.4]} intensity={0.85} color="#fff0dc" />
      <spotLight position={[0, 4.2, 2]} angle={0.5} penumbra={0.8} intensity={0.45} color="#ffffff" />
      <Environment preset="studio" environmentIntensity={0.35} />
    </>
  );
}

function Stage() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[6, 64]} />
        <meshStandardMaterial color="#121110" roughness={0.92} />
      </mesh>
      <mesh position={[0, 2.4, -3.4]} receiveShadow>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial color="#161513" roughness={1} />
      </mesh>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.45} scale={8} blur={2.2} far={3.5} />
    </>
  );
}

export default function Studio() {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true, toneMappingExposure: 1.12 }}
      camera={{ position: [0, 1.05, 3.35], fov: 32, near: 0.1, far: 40 }}
    >
      <color attach="background" args={["#0b0b0c"]} />
      <Lights />
      <Stage />
      <Woman />
      <HeroCamera />
    </Canvas>
  );
}
