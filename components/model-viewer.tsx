"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import * as THREE from "three";
import { ViewerToolbar } from "./viewer-toolbar";
import type { ModelPreset } from "./model-scenes";
import { ViewerScene } from "./model-scenes";

declare global {
  interface Window {
    __cvViewerDebug?: {
      camera?: THREE.Camera;
      controls?: {
        target: THREE.Vector3;
      } | null;
      preset?: ModelPreset;
    };
  }
}

export interface ModelViewerProps {
  className?: string;
  height?: number;
  initialPreset?: ModelPreset;
  preset?: ModelPreset;
  presetOptions?: Array<{ id: ModelPreset; label: string }>;
  onPresetChange?: (preset: ModelPreset) => void;
  scrollProgress?: number;
  subtitle?: string;
  title?: string;
}

function useFullscreenState(containerRef: RefObject<HTMLDivElement | null>) {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const onFullscreenChange = () => {
      setFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [containerRef]);

  const toggleFullscreen = async () => {
    const node = containerRef.current;
    if (!node) return;

    if (document.fullscreenElement === node) {
      await document.exitFullscreen();
      return;
    }

    const request = node.requestFullscreen ?? (node as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen;
    if (request) {
      await request.call(node);
    }
  };

  return { fullscreen, toggleFullscreen };
}

function getPresetCamera(preset: ModelPreset) {
  switch (preset) {
    case "elevator":
      return {
        position: [0.1, 1.3, 8.8] as [number, number, number],
        target: [0, 0.2, 0] as [number, number, number],
        minDistance: 5.2,
        maxDistance: 16
      };
    case "pcb":
      return {
        position: [0, 2.0, 7.2] as [number, number, number],
        target: [0, 0, 0] as [number, number, number],
        minDistance: 4.6,
        maxDistance: 14
      };
    case "truck":
      return {
        position: [0.5, 1.6, 9.1] as [number, number, number],
        target: [0.1, 0.1, 0] as [number, number, number],
        minDistance: 6,
        maxDistance: 18
      };
    case "sim-wheel":
    default:
      return {
        position: [0, 1.15, 7.6] as [number, number, number],
        target: [0, 0.1, 0] as [number, number, number],
        minDistance: 4.8,
        maxDistance: 16
      };
  }
}

export function ModelViewer({
  className,
  height = 560,
  initialPreset = "sim-wheel",
  preset: controlledPreset,
  presetOptions,
  onPresetChange,
  scrollProgress = 0,
  subtitle = "A hardware-first 3D presentation layer for technical portfolios, tuned for fast previews and controlled inspection.",
  title = "Interactive 3D portfolio viewer",
}: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const [preset, setPreset] = useState<ModelPreset>(initialPreset);
  const [wireframe, setWireframe] = useState(false);
  const [viewerKey, setViewerKey] = useState(0);
  const { fullscreen, toggleFullscreen } = useFullscreenState(containerRef);

  useEffect(() => {
    setPreset(initialPreset);
    setViewerKey((value) => value + 1);
  }, [initialPreset]);

  useEffect(() => {
    if (!controlledPreset) return;
    setPreset(controlledPreset);
    setViewerKey((value) => value + 1);
  }, [controlledPreset]);

  useEffect(() => {
    if (process.env.NODE_ENV === "production") {
      return;
    }

    window.__cvViewerDebug = {
      camera: cameraRef.current ?? undefined,
      controls: controlsRef.current ?? null,
      preset
    };
  }, [preset, viewerKey]);

  const camera = useMemo(() => getPresetCamera(preset), [preset]);

  const resetView = () => {
    setViewerKey((value) => value + 1);
  };

  const handlePresetChange = (nextPreset: ModelPreset) => {
    setPreset(nextPreset);
    setViewerKey((value) => value + 1);
    onPresetChange?.(nextPreset);
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: fullscreen ? "100%" : `${height}px`,
        minHeight: fullscreen ? "100%" : `${height}px`,
        isolation: "isolate",
        borderRadius: 28,
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.08)",
        background:
          "radial-gradient(1200px 500px at 50% 0%, rgba(220,38,38,0.12), transparent 55%), linear-gradient(180deg, rgba(9,9,12,0.98), rgba(4,4,6,0.96))",
        boxShadow:
          "0 24px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <Canvas
        key={`${preset}-${viewerKey}`}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        camera={{ position: camera.position, fov: 38, near: 0.1, far: 100 }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        onCreated={({ gl, camera: createdCamera }) => {
          gl.setClearColor(new THREE.Color("#050507"), 1);
          cameraRef.current = createdCamera;
          if (process.env.NODE_ENV !== "production") {
            window.__cvViewerDebug = {
              camera: createdCamera,
              controls: controlsRef.current ?? null,
              preset
            };
          }
        }}
      >
        <Suspense fallback={null}>
          <ViewerScene preset={preset} scrollProgress={scrollProgress} wireframe={wireframe} />
        </Suspense>
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.55}
          zoomSpeed={0.7}
          panSpeed={0.55}
          target={camera.target}
          maxPolarAngle={Math.PI * 0.92}
          minDistance={camera.minDistance}
          maxDistance={camera.maxDistance}
          makeDefault
        />
      </Canvas>

      <ViewerToolbar
        activePreset={preset}
        fullscreen={fullscreen}
        onPresetChange={handlePresetChange}
        onReset={resetView}
        onToggleFullscreen={toggleFullscreen}
        onToggleWireframe={() => setWireframe((value) => !value)}
        presetOptions={presetOptions}
        title={title}
        subtitle={subtitle}
        wireframe={wireframe}
      />
    </div>
  );
}

export default ModelViewer;
