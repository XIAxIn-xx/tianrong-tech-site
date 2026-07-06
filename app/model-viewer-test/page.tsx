'use client';

import { Component, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

import { ModelViewer } from "@/components/ui/model-viewer";
import { TianrongRobotPreview } from "@/components/ui/tianrong-robot-preview";
import SideRays from "@/components/effects/side-rays";

const MODEL_PATH = "/models/box.glb";

class ModelViewerErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 grid place-items-center px-6 text-center text-base font-medium text-slate-700">
          模型加载失败，请检查 glb 路径
        </div>
      );
    }

    return this.props.children;
  }
}

function RotatingBox() {
  const meshRef = useRef<any>(null);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.x += delta * 0.7;
    meshRef.current.rotation.y += delta * 0.9;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#2563eb" roughness={0.45} metalness={0.15} />
    </mesh>
  );
}

function PureCanvasBoxTest() {
  return (
    <div className="mt-8 h-[320px] overflow-hidden rounded-2xl border border-slate-300 bg-slate-100">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 4, 5]} intensity={1.2} />
        <RotatingBox />
      </Canvas>
    </div>
  );
}

export default function ModelViewerTestPage() {
  return (
    <main className="min-h-screen bg-white px-6 py-16 text-slate-950">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">ModelViewer 测试</h1>
        <p className="mt-3 text-base text-slate-600">用于验证 3D 模型加载与交互</p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          当前模型路径：{MODEL_PATH}
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-bold">低模机器狗预览</h2>
          <p className="mt-2 text-base text-slate-600">不依赖 glb，用基础几何体生成，用于验证官网 3D Hero 方向</p>
          <div className="relative mt-6 h-[640px] overflow-hidden rounded-3xl border border-blue-200 bg-slate-50">
            <SideRays
              speed={1.2}
              rayColor1="#2563EB"
              rayColor2="#38BDF8"
              intensity={1.1}
              spread={1.6}
              origin="top-right"
              tilt={-8}
              saturation={1.1}
              blend={0.65}
              falloff={1.8}
              opacity={0.45}
              className="absolute inset-0 z-0"
            />
            <div className="relative z-10 h-full">
              <TianrongRobotPreview />
            </div>
            <div className="absolute right-4 top-4 z-20 rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-xs text-slate-600 backdrop-blur">
              示意模型 / 非真实产品外观
            </div>
          </div>
        </section>

        <div className="relative mt-8 h-[600px] min-h-[600px] overflow-hidden rounded-2xl border border-blue-300 bg-slate-100">
          <ModelViewerErrorBoundary>
            <ModelViewer
              url={MODEL_PATH}
              width="100%"
              height="100%"
              modelXOffset={0}
              modelYOffset={0}
              defaultRotationX={-25}
              defaultRotationY={15}
              defaultZoom={0.75}
              minZoomDistance={0.55}
              maxZoomDistance={2.2}
              enableMouseParallax={true}
              enableManualRotation={true}
              enableHoverRotation={true}
              enableManualZoom={false}
              environmentPreset="none"
              ambientIntensity={0.8}
              keyLightIntensity={1.2}
              fillLightIntensity={0.8}
              rimLightIntensity={1}
              autoFrame={true}
              fadeIn={true}
              autoRotate={true}
              autoRotateSpeed={0.18}
              showScreenshotButton={false}
            />
          </ModelViewerErrorBoundary>
        </div>

        <PureCanvasBoxTest />
      </div>
    </main>
  );
}
