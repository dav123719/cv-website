"use client";

import { useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Grid } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export type ModelPreset = "sim-wheel" | "elevator" | "pcb" | "truck";

export interface SceneProps {
  preset: ModelPreset;
  scrollProgress?: number;
  wireframe: boolean;
}

type MaterialProps = {
  color: string;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  wireframe: boolean;
};

function Material({
  color,
  metalness = 0.25,
  roughness = 0.45,
  emissive,
  emissiveIntensity = 0,
  wireframe,
}: MaterialProps) {
  return (
    <meshStandardMaterial
      color={color}
      metalness={metalness}
      roughness={roughness}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      wireframe={wireframe}
    />
  );
}

function SceneEnvironment() {
  return (
    <>
      <fog attach="fog" args={["#07070a", 10, 30]} />
      <color attach="background" args={["#050507"]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[7, 9, 5]} intensity={1.65} color="#ffe4e4" />
      <directionalLight position={[-6, 4, -6]} intensity={0.55} color="#ffffff" />
      <pointLight position={[0, 3, 5]} intensity={24} color="#e11d48" />
      <Environment preset="city" />
      <Grid
        position={[0, -2.15, 0]}
        args={[24, 24]}
        cellSize={0.75}
        cellThickness={0.75}
        cellColor="rgba(255,255,255,0.12)"
        sectionColor="rgba(220,38,38,0.24)"
        sectionThickness={1.3}
        fadeDistance={28}
        fadeStrength={1.5}
        infiniteGrid
      />
      <ContactShadows
        position={[0, -2.01, 0]}
        opacity={0.6}
        scale={18}
        blur={2.6}
        far={8}
      />
    </>
  );
}

function useSubtleMotion(offset = 0.18, baseY = 0) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const group = ref.current;
    if (!group) return;
    const t = clock.getElapsedTime();
    group.rotation.y = Math.sin(t * 0.15) * offset;
    group.position.y = baseY + Math.sin(t * 0.9) * 0.035;
  });
  return ref;
}

function SimWheel({ wireframe, scrollProgress = 0 }: { wireframe: boolean; scrollProgress?: number }) {
  const ref = useSubtleMotion(0.12, 0);
  const progress = THREE.MathUtils.clamp(scrollProgress, 0, 1);

  return (
    <group ref={ref} rotation={[-0.1, 0.55 + progress * 0.4, 0]} position={[0, 0, 0]}>
      <mesh castShadow receiveShadow>
        <torusGeometry args={[1.5, 0.22, 20, 64]} />
        <Material color="#111114" metalness={0.7} roughness={0.28} wireframe={wireframe} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0, 0.04]}>
        <cylinderGeometry args={[0.72, 0.84, 0.4, 32]} />
        <Material color="#1a1a20" metalness={0.85} roughness={0.2} wireframe={wireframe} />
      </mesh>
      <group rotation={[0, 0, 0.04]}>
        <mesh castShadow receiveShadow position={[-0.3, 0.02, 0.08]} rotation={[0, 0, 0.2]}>
          <boxGeometry args={[0.2, 1.75, 0.18]} />
          <Material color="#24242b" metalness={0.75} roughness={0.28} wireframe={wireframe} />
        </mesh>
        <mesh castShadow receiveShadow position={[0.3, 0.02, 0.08]} rotation={[0, 0, -0.2]}>
          <boxGeometry args={[0.2, 1.75, 0.18]} />
          <Material color="#24242b" metalness={0.75} roughness={0.28} wireframe={wireframe} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.02, -0.05]}>
          <boxGeometry args={[1.1, 0.18, 0.18]} />
          <Material color="#2d2d35" metalness={0.65} roughness={0.35} wireframe={wireframe} />
        </mesh>
      </group>
      <group position={[0.65, 0.15, 0.35]} rotation={[0.12, -0.25, 0.2]}>
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.36, 0.16, 0.16]} />
          <Material color="#dc2626" metalness={0.2} roughness={0.42} emissive="#3f0a0a" emissiveIntensity={0.18} wireframe={wireframe} />
        </mesh>
        <mesh castShadow receiveShadow position={[0.42, 0.04, 0.02]}>
          <boxGeometry args={[0.1, 0.08, 0.08]} />
          <Material color="#f8fafc" metalness={0.12} roughness={0.42} wireframe={wireframe} />
        </mesh>
      </group>
      <group position={[-0.8, -0.45, 0.28]} rotation={[0.2, 0.15, -0.4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.36, 0.14, 0.1]} />
          <Material color="#c02626" emissive="#5b0f12" emissiveIntensity={0.15} wireframe={wireframe} />
        </mesh>
      </group>
      <group position={[0.82, -0.45, 0.28]} rotation={[0.2, -0.15, 0.4]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.36, 0.14, 0.1]} />
          <Material color="#c02626" emissive="#5b0f12" emissiveIntensity={0.15} wireframe={wireframe} />
        </mesh>
      </group>
      <mesh castShadow receiveShadow position={[0, 0, -0.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.23, 0.25, 0.42, 28]} />
        <Material color="#e5e7eb" metalness={0.68} roughness={0.26} wireframe={wireframe} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.2, 1.15, -0.16]} rotation={[0, 0.18, -0.05]}>
        <boxGeometry args={[0.25, 0.6, 0.08]} />
        <Material color="#f8fafc" metalness={0.12} roughness={0.44} wireframe={wireframe} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.2, 1.15, -0.16]} rotation={[0, -0.18, 0.05]}>
        <boxGeometry args={[0.25, 0.6, 0.08]} />
        <Material color="#f8fafc" metalness={0.12} roughness={0.44} wireframe={wireframe} />
      </mesh>
    </group>
  );
}

function Elevator({ wireframe, scrollProgress = 0 }: { wireframe: boolean; scrollProgress?: number }) {
  const ref = useSubtleMotion(0.08, -0.15);
  const progress = THREE.MathUtils.clamp(scrollProgress, 0, 1);
  const liftHeight = THREE.MathUtils.lerp(-0.8, 1.0, progress);

  return (
    <group ref={ref} position={[0, -0.15, 0]} rotation={[0, -0.18, 0]}>
      <group position={[0, 0.05, 0]}>
        <mesh castShadow receiveShadow position={[-1.4, 0, 0]}>
          <boxGeometry args={[0.12, 4.6, 0.12]} />
          <Material color="#d1d5db" metalness={0.82} roughness={0.28} wireframe={wireframe} />
        </mesh>
        <mesh castShadow receiveShadow position={[1.4, 0, 0]}>
          <boxGeometry args={[0.12, 4.6, 0.12]} />
          <Material color="#d1d5db" metalness={0.82} roughness={0.28} wireframe={wireframe} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 2.2, 0]}>
          <boxGeometry args={[3.0, 0.12, 0.12]} />
          <Material color="#cbd5e1" metalness={0.7} roughness={0.3} wireframe={wireframe} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, -2.2, 0]}>
          <boxGeometry args={[3.0, 0.12, 0.12]} />
          <Material color="#cbd5e1" metalness={0.7} roughness={0.3} wireframe={wireframe} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0, -0.95]}>
          <boxGeometry args={[2.8, 3.6, 0.08]} />
          <Material color="#111114" roughness={0.85} metalness={0.1} wireframe={wireframe} />
        </mesh>
      </group>

      <mesh castShadow receiveShadow position={[0.02, liftHeight, 0.42]}>
        <boxGeometry args={[1.2, 1.0, 0.9]} />
        <Material color="#1f2937" metalness={0.26} roughness={0.34} wireframe={wireframe} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.02, liftHeight + 0.03, 0.89]}>
        <boxGeometry args={[1.06, 0.86, 0.04]} />
        <Material color="#f8fafc" metalness={0.06} roughness={0.18} emissive="#111827" emissiveIntensity={0.04} wireframe={wireframe} />
      </mesh>

      <group position={[-0.72, -0.32, 0.54]}>
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.28, 0.12, 0.28]} />
          <Material color="#dc2626" emissive="#3f0a0a" emissiveIntensity={0.12} wireframe={wireframe} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.24, 0]}>
          <boxGeometry args={[0.26, 0.12, 0.26]} />
          <Material color="#e5e7eb" metalness={0.6} roughness={0.25} wireframe={wireframe} />
        </mesh>
      </group>

      <mesh castShadow receiveShadow position={[1.0, 0, -0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 4.4, 18]} />
        <Material color="#0f172a" metalness={0.55} roughness={0.35} wireframe={wireframe} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.35, 0.02, -0.38]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 4.2, 18]} />
        <Material color="#dc2626" emissive="#5b0f12" emissiveIntensity={0.18} metalness={0.2} roughness={0.42} wireframe={wireframe} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.65, -1.8, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.7, 16]} />
        <Material color="#9ca3af" metalness={0.84} roughness={0.18} wireframe={wireframe} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.65, 1.8, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.7, 16]} />
        <Material color="#9ca3af" metalness={0.84} roughness={0.18} wireframe={wireframe} />
      </mesh>
    </group>
  );
}

function PCB({ wireframe, scrollProgress = 0 }: { wireframe: boolean; scrollProgress?: number }) {
  const ref = useSubtleMotion(0.16, -0.2);
  const progress = THREE.MathUtils.clamp(scrollProgress, 0, 1);

  const components = useMemo(
    () => [
      { pos: [-0.95, 0.12, -0.7] as [number, number, number], size: [0.55, 0.14, 0.35] as [number, number, number], color: "#111827" },
      { pos: [0.45, 0.12, -0.55] as [number, number, number], size: [0.68, 0.14, 0.42] as [number, number, number], color: "#1f2937" },
      { pos: [0.85, 0.12, 0.55] as [number, number, number], size: [0.4, 0.14, 0.4] as [number, number, number], color: "#374151" },
      { pos: [-0.2, 0.12, 0.58] as [number, number, number], size: [0.55, 0.14, 0.34] as [number, number, number], color: "#0f172a" },
    ],
    []
  );

  return (
    <group
      ref={ref}
      rotation={[-0.25 - progress * 0.08, 0.65 + progress * 0.25, 0.15]}
      position={[0, -0.2, 0]}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.8, 0.2, 2.35]} />
        <Material color="#0f5132" metalness={0.12} roughness={0.7} wireframe={wireframe} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.13, 0]}>
        <boxGeometry args={[3.55, 0.035, 2.1]} />
        <Material color="#14532d" metalness={0.05} roughness={0.55} wireframe={wireframe} />
      </mesh>

      {components.map((item) => (
        <mesh key={item.pos.join("-")} castShadow receiveShadow position={item.pos}>
          <boxGeometry args={item.size} />
          <Material color={item.color} metalness={0.35} roughness={0.45} wireframe={wireframe} />
        </mesh>
      ))}

      <group position={[-0.85, 0.18, -0.48]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.16, 18]} />
          <Material color="#1f2937" metalness={0.5} roughness={0.35} wireframe={wireframe} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.28, 16]} />
          <Material color="#dc2626" emissive="#4c0508" emissiveIntensity={0.18} metalness={0.12} roughness={0.35} wireframe={wireframe} />
        </mesh>
      </group>

      <group position={[1.28, 0.17, 0.75]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.18, 0.34]} />
          <Material color="#9ca3af" metalness={0.72} roughness={0.2} wireframe={wireframe} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, 0.1, 0.12]}>
          <boxGeometry args={[0.12, 0.12, 0.12]} />
          <Material color="#f8fafc" metalness={0.1} roughness={0.2} wireframe={wireframe} />
        </mesh>
      </group>

      {Array.from({ length: 12 }).map((_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        const radius = 1.46;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * 0.85;
        return (
          <mesh key={index} castShadow receiveShadow position={[x, 0.14, z]} rotation={[0, angle, 0]}>
            <boxGeometry args={[0.18, 0.08, 0.08]} />
            <Material color="#d1d5db" metalness={0.55} roughness={0.2} wireframe={wireframe} />
          </mesh>
        );
      })}

      {Array.from({ length: 8 }).map((_, index) => {
        const x = -1.35 + index * 0.38;
        return (
          <mesh key={`trace-${index}`} castShadow receiveShadow position={[x, 0.145, 0.05 + Math.sin(index) * 0.2]}>
            <boxGeometry args={[0.22, 0.02, 0.04]} />
            <Material color={index % 2 === 0 ? "#dc2626" : "#f8fafc"} metalness={0.14} roughness={0.32} wireframe={wireframe} />
          </mesh>
        );
      })}
    </group>
  );
}

function Truck({ wireframe, scrollProgress = 0 }: { wireframe: boolean; scrollProgress?: number }) {
  const ref = useSubtleMotion(0.1, -0.25);
  const progress = THREE.MathUtils.clamp(scrollProgress, 0, 1);

  return (
    <group ref={ref} rotation={[0.02, -0.42 + progress * 0.12, 0]} position={[0, -0.25, 0]}>
      <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
        <boxGeometry args={[4.6, 0.5, 1.55]} />
        <Material color="#101114" metalness={0.55} roughness={0.3} wireframe={wireframe} />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.95, 0.5, 0]}>
        <boxGeometry args={[1.5, 1.2, 1.5]} />
        <Material color="#1d1d22" metalness={0.35} roughness={0.26} wireframe={wireframe} />
      </mesh>
      <mesh castShadow receiveShadow position={[-1.42, 0.66, 0]}>
        <boxGeometry args={[0.5, 0.82, 1.42]} />
        <Material color="#dc2626" emissive="#41080b" emissiveIntensity={0.12} metalness={0.22} roughness={0.34} wireframe={wireframe} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.95, 0.65, 0]}>
        <boxGeometry args={[2.0, 1.02, 1.38]} />
        <Material color="#f8fafc" metalness={0.08} roughness={0.3} wireframe={wireframe} />
      </mesh>
      <mesh castShadow receiveShadow position={[1.1, 0.85, 0.73]}>
        <boxGeometry args={[0.58, 0.55, 0.06]} />
        <Material color="#0f172a" roughness={0.25} metalness={0.6} wireframe={wireframe} />
      </mesh>
      <mesh castShadow receiveShadow position={[-1.95, 0.9, 0.72]}>
        <boxGeometry args={[0.45, 0.38, 0.06]} />
        <Material color="#e5e7eb" roughness={0.15} metalness={0.55} wireframe={wireframe} />
      </mesh>

      <group position={[-1.35, -0.5, 0.86]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.36, 20]} />
          <Material color="#15151a" metalness={0.42} roughness={0.38} wireframe={wireframe} />
        </mesh>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.38, 20]} />
          <Material color="#474750" metalness={0.72} roughness={0.22} wireframe={wireframe} />
        </mesh>
      </group>
      <group position={[1.55, -0.5, 0.86]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.36, 20]} />
          <Material color="#15151a" metalness={0.42} roughness={0.38} wireframe={wireframe} />
        </mesh>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.38, 20]} />
          <Material color="#474750" metalness={0.72} roughness={0.22} wireframe={wireframe} />
        </mesh>
      </group>
      <group position={[-1.35, -0.5, -0.86]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.36, 20]} />
          <Material color="#15151a" metalness={0.42} roughness={0.38} wireframe={wireframe} />
        </mesh>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.38, 20]} />
          <Material color="#474750" metalness={0.72} roughness={0.22} wireframe={wireframe} />
        </mesh>
      </group>
      <group position={[1.55, -0.5, -0.86]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.36, 20]} />
          <Material color="#15151a" metalness={0.42} roughness={0.38} wireframe={wireframe} />
        </mesh>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.38, 20]} />
          <Material color="#474750" metalness={0.72} roughness={0.22} wireframe={wireframe} />
        </mesh>
      </group>
      <mesh castShadow receiveShadow position={[0.35, 0.15, 0]} rotation={[0, 0, -0.07]}>
        <boxGeometry args={[1.85, 0.14, 1.28]} />
        <Material color="#ef4444" emissive="#470b10" emissiveIntensity={0.1} metalness={0.18} roughness={0.38} wireframe={wireframe} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.5, 0.36, 0]}>
        <boxGeometry args={[1.15, 0.1, 0.12]} />
        <Material color="#d1d5db" metalness={0.6} roughness={0.28} wireframe={wireframe} />
      </mesh>
    </group>
  );
}

export function ViewerScene({
  preset,
  scrollProgress = 0,
  wireframe,
}: SceneProps) {
  return (
    <>
      <SceneEnvironment />
      <group position={[0, 0.12, 0]}>
        {preset === "sim-wheel" ? (
          <SimWheel wireframe={wireframe} scrollProgress={scrollProgress} />
        ) : null}
        {preset === "elevator" ? (
          <Elevator wireframe={wireframe} scrollProgress={scrollProgress} />
        ) : null}
        {preset === "pcb" ? <PCB wireframe={wireframe} scrollProgress={scrollProgress} /> : null}
        {preset === "truck" ? <Truck wireframe={wireframe} scrollProgress={scrollProgress} /> : null}
      </group>
    </>
  );
}
