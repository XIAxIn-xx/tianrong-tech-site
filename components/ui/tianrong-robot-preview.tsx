'use client';

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

function BoxPart({ position, scale, color = "#f8fafc" }: { position: [number, number, number]; scale: [number, number, number]; color?: string }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.42} metalness={0.18} />
    </mesh>
  );
}

function Joint({ position, scale = 0.16 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} scale={scale} castShadow>
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.25} />
    </mesh>
  );
}

function WheelFoot({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  return (
    <mesh position={position} rotation={rotation} scale={[0.18, 0.18, 0.08]} castShadow>
      <cylinderGeometry args={[1, 1, 1, 32]} />
      <meshStandardMaterial color="#1f2937" roughness={0.56} metalness={0.2} />
    </mesh>
  );
}

function Leg({ x, z }: { x: number; z: number }) {
  const side = z > 0 ? 1 : -1;

  return (
    <group>
      <Joint position={[x, 0.28, z]} />
      <BoxPart position={[x, -0.12, z + side * 0.05]} scale={[0.14, 0.62, 0.14]} color="#475569" />
      <Joint position={[x, -0.48, z + side * 0.08]} scale={0.13} />
      <BoxPart position={[x, -0.78, z + side * 0.14]} scale={[0.12, 0.48, 0.12]} color="#64748b" />
      <WheelFoot position={[x, -1.05, z + side * 0.22]} rotation={[Math.PI / 2, 0, 0]} />
    </group>
  );
}

function LowPolyRobotDog() {
  const groupRef = useRef<any>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.24;
  });

  return (
    <group ref={groupRef} rotation={[-0.08, -0.55, 0]} position={[0, 0.25, 0]}>
      <BoxPart position={[0, 0.35, 0]} scale={[2.25, 0.52, 0.78]} color="#f8fafc" />
      <BoxPart position={[0.08, 0.8, 0]} scale={[1.18, 0.36, 0.58]} color="#e2e8f0" />
      <BoxPart position={[1.32, 0.42, 0]} scale={[0.58, 0.42, 0.62]} color="#e5e7eb" />
      <BoxPart position={[1.66, 0.46, 0]} scale={[0.12, 0.2, 0.42]} color="#111827" />
      <BoxPart position={[1.75, 0.56, 0.16]} scale={[0.06, 0.08, 0.08]} color="#38bdf8" />
      <BoxPart position={[1.75, 0.56, -0.16]} scale={[0.06, 0.08, 0.08]} color="#38bdf8" />
      <BoxPart position={[-1.28, 0.38, 0]} scale={[0.28, 0.34, 0.52]} color="#cbd5e1" />
      <Leg x={0.72} z={0.42} />
      <Leg x={0.72} z={-0.42} />
      <Leg x={-0.72} z={0.42} />
      <Leg x={-0.72} z={-0.42} />
      <mesh position={[0, -1.16, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2.6, 48]} />
        <meshStandardMaterial color="#dbe3ea" roughness={0.86} />
      </mesh>
    </group>
  );
}

export function TianrongRobotPreview() {
  return (
    <div className="h-full w-full">
      <Canvas shadows camera={{ position: [3.6, 2.2, 4.8], fov: 38 }} dpr={[1, 2]}>
        <color attach="background" args={["#f1f5f9"]} />
        <ambientLight intensity={0.78} />
        <directionalLight position={[4, 5, 4]} intensity={1.2} castShadow />
        <directionalLight position={[-4, 2, -3]} intensity={0.45} />
        <LowPolyRobotDog />
      </Canvas>
    </div>
  );
}

export default TianrongRobotPreview;
