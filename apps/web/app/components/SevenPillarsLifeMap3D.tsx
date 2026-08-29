"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Text } from "@react-three/drei";
import { useRef, useState } from "react";
import * as THREE from "three";

const pillars = [
  ["01", "Digital Life", "#63c7d8"],
  ["02", "Financial & Assets", "#9b8bd4"],
  ["03", "Household & Property", "#d49a62"],
  ["04", "Health & Medical", "#73b98b"],
  ["05", "Vital Records", "#d9b45a"],
  ["06", "Legacy & Wishes", "#c9829b"],
  ["07", "Business Continuity", "#b8a27a"],
] as const;

function Pillar({ index, label, color, selected, onSelect }: { index: string; label: string; color: string; selected: boolean; onSelect: () => void }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.y = Math.sin(t * 0.8 + Number(index)) * 0.06;
    ref.current.rotation.y = Math.sin(t * 0.35 + Number(index)) * 0.08;
  });
  const angle = ((Number(index) - 1) / 7) * Math.PI * 2;
  const radius = 2.45;
  return (
    <group ref={ref} position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]} rotation={[0, -angle + Math.PI / 2, 0]} onClick={onSelect}>
      <mesh scale={selected ? [1.12, 1.12, 1.12] : [1, 1, 1]}>
        <cylinderGeometry args={[0.38, 0.48, 1.55, 32]} />
        <meshStandardMaterial color={color} metalness={0.45} roughness={0.32} emissive={color} emissiveIntensity={selected ? 0.22 : 0.07} />
      </mesh>
      <Text position={[0, 0.95, 0]} fontSize={0.19} color="white" anchorX="center" anchorY="middle" maxWidth={1.3}>{label}</Text>
      <Text position={[0, -0.98, 0]} fontSize={0.16} color={color} anchorX="center" anchorY="middle">{index}</Text>
    </group>
  );
}

function Core() {
  return (
    <Float speed={1.2} rotationIntensity={0.12} floatIntensity={0.16}>
      <mesh>
        <icosahedronGeometry args={[0.8, 2]} />
        <meshStandardMaterial color="#d9b45a" metalness={0.8} roughness={0.2} emissive="#5c4310" emissiveIntensity={0.18} wireframe />
      </mesh>
      <Text position={[0, -1.15, 0]} fontSize={0.22} color="#f0c85a" anchorX="center">LIFE MAP</Text>
    </Float>
  );
}

export default function SevenPillarsLifeMap3D() {
  const [selected, setSelected] = useState("01");
  const current = pillars.find(([id]) => id === selected) ?? pillars[0];
  return (
    <section aria-labelledby="life-map-heading" className="overflow-hidden rounded-2xl border border-[#d9b45a]/25 bg-[#070706] shadow-2xl">
      <div className="border-b border-white/10 p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-[#d9b45a]">Legacy OS · Interactive Life Map</p>
        <h2 id="life-map-heading" className="mt-1 text-2xl font-semibold text-white">Seven Pillars of Continuity</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">A spatial view of the life system, designed as the foundation for deeper pillar experiences and Elara guidance.</p>
      </div>
      <div className="grid lg:grid-cols-[1fr_260px]">
        <div className="h-[500px] min-h-[420px] bg-[radial-gradient(circle_at_center,rgba(217,180,90,.12),transparent_42%),#030303]">
          <Canvas camera={{ position: [0, 3.8, 7], fov: 45 }} dpr={[1, 2]}>
            <ambientLight intensity={0.45} />
            <pointLight position={[0, 3, 3]} intensity={18} distance={12} />
            <pointLight position={[-4, 2, -2]} intensity={8} distance={10} />
            <Core />
            {pillars.map(([id, label, color]) => <Pillar key={id} index={id} label={label} color={color} selected={selected === id} onSelect={() => setSelected(id)} />)}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.85, 0]}>
              <circleGeometry args={[3.45, 64]} />
              <meshStandardMaterial color="#15130f" metalness={0.2} roughness={0.75} />
            </mesh>
            <OrbitControls enablePan={false} minDistance={5.5} maxDistance={9} enableDamping dampingFactor={0.06} />
          </Canvas>
        </div>
        <aside className="border-t border-white/10 bg-white/[0.025] p-5 lg:border-l lg:border-t-0">
          <p className="text-xs uppercase tracking-[0.2em] text-white/35">Selected pillar</p>
          <p className="mt-2 text-3xl font-semibold" style={{ color: current[2] }}>{current[0]}</p>
          <h3 className="mt-1 text-lg font-semibold text-white">{current[1]}</h3>
          <p className="mt-3 text-sm leading-6 text-white/50">Select a pillar in the map to make it the active continuity area.</p>
          <div className="mt-6 space-y-2">
            {pillars.map(([id, label, color]) => <button key={id} type="button" onClick={() => setSelected(id)} aria-pressed={selected === id} className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${selected === id ? "border-white/20 bg-white/10" : "border-white/5 bg-black/20 hover:bg-white/5"}`}><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} /><span className="text-white/70">{id} · {label}</span></button>)}
          </div>
        </aside>
      </div>
    </section>
  );
}
