"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function ContinuityCore() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.08;
  });
  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.35, 2]} />
        <meshStandardMaterial color="#b98a25" metalness={0.9} roughness={0.22} wireframe />
      </mesh>
      <mesh scale={0.68}>
        <icosahedronGeometry args={[1.35, 1]} />
        <meshStandardMaterial color="#e7b84b" emissive="#3a2908" emissiveIntensity={0.35} metalness={0.75} roughness={0.25} />
      </mesh>
    </group>
  );
}

const pillars = [
  "Digital Life",
  "Financial & Assets",
  "Household & Property",
  "Health & Medical",
  "Legal & Estate",
  "Business Continuity",
  "Legacy & Wishes",
];

export function ContinuityScene() {
  return (
    <div className="relative h-[430px] overflow-hidden rounded-2xl border border-[#e7b84b]/25 bg-[#020202]">
      <Canvas camera={{ position: [0, 0, 4.8], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true, powerPreference: "high-performance" }}>
        <ambientLight intensity={0.25} />
        <pointLight position={[3, 3, 4]} intensity={18} color="#e7b84b" />
        <pointLight position={[-3, -2, 2]} intensity={8} color="#6f7b91" />
        <Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.22}>
          <ContinuityCore />
        </Float>
        <Environment preset="night" />
        <OrbitControls enablePan={false} minDistance={3.5} maxDistance={7} />
      </Canvas>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(231,184,75,0.10),transparent_42%)]" />

      <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-3 rounded-xl border border-[#e7b84b]/20 bg-black/60 px-3 py-2 backdrop-blur-sm">
        <img src="/brand/legacy-architect-rva-logo.svg" alt="Legacy Architect RVA" className="h-10 w-auto" />
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#e7b84b]">Legacy OS</p>
          <p className="text-xs text-white/55">Life Map</p>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#e7b84b]">Seven Pillars of Continuity</p>
        <div className="mx-auto mt-4 grid max-w-2xl grid-cols-2 gap-2 px-8 sm:grid-cols-4">
          {pillars.map((pillar, index) => (
            <div key={pillar} className="rounded-lg border border-white/10 bg-black/45 px-2 py-2 backdrop-blur-sm">
              <span className="text-[9px] text-[#e7b84b]">0{index + 1}</span>
              <span className="ml-1 text-[10px] text-white/65">{pillar}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-5 bottom-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#e7b84b]">Continuity Core</p>
          <p className="mt-1 text-sm text-white/50">One system connecting everything that matters.</p>
        </div>
        <div className="hidden rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-[10px] text-white/45 backdrop-blur-sm sm:block">
          Drag to rotate · Scroll to zoom · Select a pillar to explore
        </div>
      </div>
    </div>
  );
}
