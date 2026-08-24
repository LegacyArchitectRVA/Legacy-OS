"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function ContinuityCore() {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => { if (group.current) group.current.rotation.y += delta * 0.08; });
  return <group ref={group}><mesh><icosahedronGeometry args={[1.35, 2]} /><meshStandardMaterial color="#b98a25" metalness={0.9} roughness={0.22} wireframe /></mesh><mesh scale={0.68}><icosahedronGeometry args={[1.35, 1]} /><meshStandardMaterial color="#e7b84b" emissive="#3a2908" emissiveIntensity={0.35} metalness={0.75} roughness={0.25} /></mesh></group>;
}

export function ContinuityScene() {
  return <div className="relative h-[340px] overflow-hidden rounded-2xl border border-[#e7b84b]/20 bg-[#050505]"><Canvas camera={{ position: [0, 0, 4.8], fov: 42 }} dpr={[1, 2]} gl={{ antialias: true, powerPreference: "high-performance" }}><ambientLight intensity={0.25} /><pointLight position={[3, 3, 4]} intensity={18} color="#e7b84b" /><pointLight position={[-3, -2, 2]} intensity={8} color="#6f7b91" /><Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.22}><ContinuityCore /></Float><Environment preset="night" /><OrbitControls enablePan={false} minDistance={3.5} maxDistance={7} /></Canvas><div className="pointer-events-none absolute inset-x-5 bottom-5"><p className="text-xs uppercase tracking-[0.24em] text-[#e7b84b]">Continuity Core</p><p className="mt-1 text-sm text-white/50">Seven domains. One living system.</p></div></div>;
}
