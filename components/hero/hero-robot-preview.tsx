'use client';

import { Suspense, useMemo, useRef } from "react";
import { Bounds, Center, Html, OrbitControls, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";

const MODEL_URL = "/models/tianrong-robot-dog.glb";

function Loader() {
  return (
    <Html center>
      <div className="rounded-md border border-slate-200 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
        模型加载中
      </div>
    </Html>
  );
}

function TianrongRobotDogModel() {
  const groupRef = useRef<any>(null);
  const { scene } = useGLTF(MODEL_URL);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
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
    <Canvas gl={{ alpha: true, antialias: true }} camera={{ position: [4.6, 2.24, 5.9], fov: 39 }} dpr={[1, 1.5]}>
      <ambientLight intensity={0.72} />
      <directionalLight position={[4, 5, 4]} intensity={1.18} />
      <directionalLight position={[-4, 2, -3]} intensity={0.42} />
      <Suspense fallback={<Loader />}>
        <Bounds fit clip observe margin={1.42}>
          <TianrongRobotDogModel />
        </Bounds>
      </Suspense>
      <OrbitControls enablePan={false} enableZoom={false} enableRotate minPolarAngle={0.9} maxPolarAngle={1.75} />
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);

export default HeroRobotPreview;
