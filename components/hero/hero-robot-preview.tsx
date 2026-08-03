'use client';

import { Component, Suspense, useMemo, useRef, type ReactNode } from "react";
import { Bounds, Center, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";

const LEGACY_MODEL_PATH = "/models/tianrong-robot-dog.v1.glb";
const INDUSTRIAL_V1_MODEL_PATH = "/models/tianrong-robot-dog-industrial.glb";
const REPAIRED_MODEL_PATH = "/models/tianrong-robot-dog-industrial-repaired.glb";
const USE_REPAIRED_MODEL = true;
const MODEL_URL = USE_REPAIRED_MODEL ? REPAIRED_MODEL_PATH : INDUSTRIAL_V1_MODEL_PATH;

function Loader() {
  return (
    <Html center>
      <div className="rounded-md border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
        模型加载中
      </div>
    </Html>
  );
}

class ModelErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid h-full w-full place-items-center bg-[#0A293D] px-6 text-center text-sm text-[#BDEAF7]">
          机器人模型暂时无法加载
        </div>
      );
    }

    return this.props.children;
  }
}

function TianrongRobotDogModel() {
  const groupRef = useRef<any>(null);
  const { scene } = useGLTF(MODEL_URL);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const reduceMotion = useReducedMotion();

  useFrame((_, delta) => {
    if (!groupRef.current || reduceMotion) return;
    groupRef.current.rotation.y += delta * 0.22;
  });

  return (
    <Center position={[0, -0.16, 0]}>
      <group ref={groupRef} rotation={[0, -0.92, 0]} scale={0.87}>
        <primitive object={clonedScene} />
      </group>
    </Center>
  );
}

export function HeroRobotPreview() {
  return (
    <ModelErrorBoundary>
      <Canvas gl={{ alpha: true, antialias: false, powerPreference: "low-power" }} camera={{ position: [5.4, 2.8, 7.0], fov: 42 }} dpr={[1, 1.25]}>
        <ambientLight intensity={0.66} />
        <directionalLight position={[4.5, 5.5, 5]} intensity={1.0} />
        <directionalLight position={[-4, 2.5, -3]} intensity={0.34} />
        <Suspense fallback={<Loader />}>
          <Bounds fit clip observe margin={1.16}>
            <TianrongRobotDogModel />
          </Bounds>
        </Suspense>
        <OrbitControls enablePan={false} enableZoom={false} enableRotate minPolarAngle={0.9} maxPolarAngle={1.75} />
      </Canvas>
    </ModelErrorBoundary>
  );
}

export default HeroRobotPreview;
