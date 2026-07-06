'use client';

import { Suspense, useMemo, useRef, useState } from "react";
import { Bounds, Center, Environment, Html, OrbitControls, useGLTF, useProgress } from "@react-three/drei";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";

export type ModelViewerProps = {
  url: string;
  width?: number | string;
  height?: number | string;
  modelXOffset?: number;
  modelYOffset?: number;
  defaultRotationX?: number;
  defaultRotationY?: number;
  defaultZoom?: number;
  minZoomDistance?: number;
  maxZoomDistance?: number;
  enableMouseParallax?: boolean;
  enableManualRotation?: boolean;
  enableHoverRotation?: boolean;
  enableManualZoom?: boolean;
  environmentPreset?: "none" | "apartment" | "city" | "dawn" | "forest" | "lobby" | "night" | "park" | "studio" | "sunset" | "warehouse";
  ambientIntensity?: number;
  keyLightIntensity?: number;
  fillLightIntensity?: number;
  rimLightIntensity?: number;
  autoFrame?: boolean;
  fadeIn?: boolean;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  showScreenshotButton?: boolean;
};

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function Loader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
        加载中 {Math.round(progress)}%
      </div>
    </Html>
  );
}

function Model({
  url,
  modelXOffset,
  modelYOffset,
  defaultRotationX,
  defaultRotationY,
  defaultZoom,
  enableHoverRotation,
  autoRotate,
  autoRotateSpeed,
  fadeIn
}: Required<Pick<ModelViewerProps, "url" | "modelXOffset" | "modelYOffset" | "defaultRotationX" | "defaultRotationY" | "defaultZoom" | "enableHoverRotation" | "autoRotate" | "autoRotateSpeed" | "fadeIn">>) {
  const groupRef = useRef<any>(null);
  const { scene } = useGLTF(url);
  const [hoverRotation, setHoverRotation] = useState({ x: 0, y: 0 });
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (autoRotate) {
      groupRef.current.rotation.y += autoRotateSpeed * delta;
    }

    if (enableHoverRotation) {
      groupRef.current.rotation.x += (toRadians(defaultRotationX) + hoverRotation.x - groupRef.current.rotation.x) * 0.08;
      groupRef.current.rotation.y += (toRadians(defaultRotationY) + hoverRotation.y - groupRef.current.rotation.y) * 0.04;
    }
  });

  function handlePointerMove(event: ThreeEvent<PointerEvent>) {
    if (!enableHoverRotation) return;

    setHoverRotation({
      x: -event.pointer.y * 0.18,
      y: event.pointer.x * 0.28
    });
  }

  function handlePointerOut() {
    setHoverRotation({ x: 0, y: 0 });
  }

  return (
    <group position={[modelXOffset, modelYOffset, 0]} onPointerMove={handlePointerMove} onPointerOut={handlePointerOut}>
      <Center>
        <group
          ref={groupRef}
          rotation={[toRadians(defaultRotationX), toRadians(defaultRotationY), 0]}
          scale={defaultZoom}
        >
          <primitive object={clonedScene} />
        </group>
      </Center>
    </group>
  );
}

export function ModelViewer({
  url,
  width = "100%",
  height = 600,
  modelXOffset = 0,
  modelYOffset = 0,
  defaultRotationX = 0,
  defaultRotationY = 0,
  defaultZoom = 1,
  minZoomDistance = 0.5,
  maxZoomDistance = 2.5,
  enableMouseParallax = true,
  enableManualRotation = true,
  enableHoverRotation = true,
  enableManualZoom = false,
  environmentPreset = "studio",
  ambientIntensity = 0.55,
  keyLightIntensity = 1.25,
  fillLightIntensity = 0.65,
  rimLightIntensity = 1,
  autoFrame = true,
  fadeIn = true,
  autoRotate = true,
  autoRotateSpeed = 0.18,
  showScreenshotButton = false
}: ModelViewerProps) {
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const shouldUseEnvironment = environmentPreset !== "none";

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!enableMouseParallax) return;

    const rect = event.currentTarget.getBoundingClientRect();
    setParallax({
      x: ((event.clientX - rect.left) / rect.width - 0.5) * 0.35,
      y: ((event.clientY - rect.top) / rect.height - 0.5) * -0.22
    });
  }

  function handleMouseLeave() {
    setParallax({ x: 0, y: 0 });
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
      style={{ width, height }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Canvas camera={{ position: [parallax.x, parallax.y, 4.5], fov: 42 }} dpr={[1, 2]}>
        <ambientLight intensity={ambientIntensity} />
        <directionalLight position={[4, 5, 5]} intensity={keyLightIntensity} />
        <directionalLight position={[-5, 2, 3]} intensity={fillLightIntensity} />
        <directionalLight position={[0, 4, -5]} intensity={rimLightIntensity} />
        <Suspense fallback={<Loader />}>
          {shouldUseEnvironment && (
            <Environment preset={environmentPreset as any} background={false} />
          )}
          {autoFrame ? (
            <Bounds fit clip observe margin={1.2}>
              <Model
                url={url}
                modelXOffset={modelXOffset}
                modelYOffset={modelYOffset}
                defaultRotationX={defaultRotationX}
                defaultRotationY={defaultRotationY}
                defaultZoom={defaultZoom}
                enableHoverRotation={enableHoverRotation}
                autoRotate={autoRotate}
                autoRotateSpeed={autoRotateSpeed}
                fadeIn={fadeIn}
              />
            </Bounds>
          ) : (
            <Model
              url={url}
              modelXOffset={modelXOffset}
              modelYOffset={modelYOffset}
              defaultRotationX={defaultRotationX}
              defaultRotationY={defaultRotationY}
              defaultZoom={defaultZoom}
              enableHoverRotation={enableHoverRotation}
              autoRotate={autoRotate}
              autoRotateSpeed={autoRotateSpeed}
              fadeIn={fadeIn}
            />
          )}
        </Suspense>
        <OrbitControls
          enableRotate={enableManualRotation}
          enableZoom={enableManualZoom}
          enablePan={false}
          minDistance={minZoomDistance}
          maxDistance={maxZoomDistance}
        />
      </Canvas>
      {showScreenshotButton ? (
        <button className="absolute bottom-4 right-4 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white" type="button">
          截图
        </button>
      ) : null}
    </div>
  );
}

export default ModelViewer;
