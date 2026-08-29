"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

export type ElaraGuide3DProps = {
  activePillar?: string;
  compact?: boolean;
};

const pillarMessages: Record<string, string> = {
  "01": "I’ll help you make your digital life easier to understand and hand off.",
  "02": "We’ll map the financial and asset information someone may need to act on.",
  "03": "We’ll organize the household knowledge that keeps life moving.",
  "04": "We’ll keep important health and medical information where it can be found.",
  "05": "We’ll organize the vital records that prove who you are and what matters.",
  "06": "We’ll preserve the stories, wishes, and personal guidance that matter to you.",
  "07": "We’ll build the business knowledge needed to keep things moving when you’re unavailable.",
};

function ElaraFigure({ active }: { active: boolean }) {
  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const hair = useRef<THREE.Mesh>(null);

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;
    if (group.current) {
      group.current.position.y = Math.sin(t * 1.15) * 0.045;
      group.current.rotation.y += (pointer.x * 0.08 - group.current.rotation.y) * 0.025;
    }
    if (head.current) {
      head.current.rotation.y += (pointer.x * 0.12 - head.current.rotation.y) * 0.035;
      head.current.rotation.x += (-pointer.y * 0.06 - head.current.rotation.x) * 0.035;
    }
    if (hair.current) {
      hair.current.rotation.z = Math.sin(t * 0.75) * 0.018;
    }
  });

  return (
    <group ref={group}>
      <mesh position={[0, -0.82, 0]}>
        <sphereGeometry args={[0.95, 32, 24]} />
        <meshStandardMaterial color="#17131a" roughness={0.55} metalness={0.12} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.47, 0.62, 1.05, 32]} />
        <meshStandardMaterial color="#30233a" roughness={0.6} />
      </mesh>
      <group ref={head} position={[0, 0.75, 0]}>
        <mesh>
          <sphereGeometry args={[0.48, 40, 32]} />
          <meshStandardMaterial color="#f1c8a8" roughness={0.8} />
        </mesh>
        <mesh position={[-0.18, 0.07, 0.43]} scale={[0.055, 0.075, 0.035]}>
          <sphereGeometry args={[1, 20, 16]} />
          <meshStandardMaterial color="#263f2f" roughness={0.4} />
        </mesh>
        <mesh position={[0.18, 0.07, 0.43]} scale={[0.055, 0.075, 0.035]}>
          <sphereGeometry args={[1, 20, 16]} />
          <meshStandardMaterial color="#263f2f" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.09, 0.445]} scale={[0.075, 0.025, 0.025]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#a85e58" roughness={0.7} />
        </mesh>
        <mesh ref={hair} position={[0, 0.12, -0.1]} scale={[1.08, 1.22, 0.9]}>
          <sphereGeometry args={[0.5, 32, 24]} />
          <meshStandardMaterial color="#9b4d32" roughness={0.82} />
        </mesh>
        <mesh position={[-0.49, -0.02, -0.02]} rotation={[0, 0, 0.18]}>
          <sphereGeometry args={[0.2, 24, 20]} />
          <meshStandardMaterial color="#9b4d32" roughness={0.82} />
        </mesh>
        <mesh position={[0.49, -0.02, -0.02]} rotation={[0, 0, -0.18]}>
          <sphereGeometry args={[0.2, 24, 20]} />
          <meshStandardMaterial color="#9b4d32" roughness={0.82} />
        </mesh>
      </group>
      <pointLight position={[0, 0.7, 1.8]} intensity={active ? 2.4 : 1.6} distance={4} color="#f0d6b2" />
    </group>
  );
}

export default function ElaraGuide3D({ activePillar = "01", compact = false }: ElaraGuide3DProps) {
  const message = pillarMessages[activePillar] ?? pillarMessages["01"];
  return (
    <section aria-label="Elara guide" className="overflow-hidden rounded-2xl border border-[#d9b45a]/25 bg-[#09080b]">
      <div className="grid items-center md:grid-cols-[220px_1fr]">
        <div className={compact ? "h-[230px]" : "h-[300px]"}>
          <Canvas camera={{ position: [0, 0.25, 3.4], fov: 38 }} dpr={[1, 2]}>
            <ambientLight intensity={0.7} />
            <directionalLight position={[2, 3, 4]} intensity={2.2} />
            <Float speed={1.1} rotationIntensity={0.05} floatIntensity={0.08}>
              <ElaraFigure active={Boolean(activePillar)} />
            </Float>
            <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={1.25} maxPolarAngle={1.9} />
          </Canvas>
        </div>
        <div className="p-6 md:pr-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[#d9b45a]">Your guide</p>
          <h2 className="mt-1 font-serif text-3xl text-white">Elara</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">{message}</p>
          <p className="mt-4 text-xs text-white/35">Fluid 3D guide foundation. Voice, gaze, gestures, and deeper pillar actions attach here.</p>
        </div>
      </div>
    </section>
  );
}
