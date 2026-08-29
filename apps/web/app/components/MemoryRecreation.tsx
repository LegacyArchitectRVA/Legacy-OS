"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

type Evidence = "verified" | "reconstructed";

export interface MemoryRecreationProps {
  personName: string;
  question?: string;
  portraitUri?: string;
  verifiedMemories?: string[];
  reconstructedResponse?: string;
}

function ReconstructionFigure({ personName }: { personName: string }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const t = clock.elapsedTime;
    group.position.y = Math.sin(t * 0.9) * 0.05;
    group.rotation.y = Math.sin(t * 0.3) * 0.05;
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.48, 48, 48]} />
        <meshBasicMaterial color="#7ee7f2" wireframe transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <capsuleGeometry args={[0.48, 1.25, 8, 32]} />
        <meshBasicMaterial color="#63c7d8" wireframe transparent opacity={0.55} />
      </mesh>
      <pointLight color="#63c7d8" intensity={8} distance={5} />
      <Float speed={1.2} floatIntensity={0.1}>
        <Text position={[0, -1.25, 0]} fontSize={0.2} color="#b7f5fa" anchorX="center">{personName.toUpperCase()}</Text>
      </Float>
    </group>
  );
}

export default function MemoryRecreation({
  personName,
  question = "What do you remember?",
  verifiedMemories = [],
  reconstructedResponse = "I can only reconstruct a response from preserved memories and evidence.",
}: MemoryRecreationProps) {
  const [evidence, setEvidence] = useState<Evidence>("verified");
  const response = evidence === "verified"
    ? verifiedMemories[0] ?? `No verified memory has been preserved for ${personName} yet.`
    : reconstructedResponse;

  return (
    <section aria-labelledby="memory-recreation-heading" className="overflow-hidden rounded-2xl border border-cyan-200/20 bg-[#020617] text-white shadow-2xl">
      <div className="border-b border-white/10 p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Legacy Recall · Immersive Memory Recreation</p>
        <h2 id="memory-recreation-heading" className="mt-1 text-2xl font-semibold">Talk with {personName}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">Recreate meaningful moments from preserved photos, recordings, stories, documents, and other evidence. The system separates authentic source material from AI reconstruction.</p>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="h-[430px] bg-[radial-gradient(circle_at_center,rgba(34,211,238,.2),transparent_50%),#020617]">
          <Canvas camera={{ position: [0, 1.1, 4.4], fov: 42 }} dpr={[1, 2]}>
            <ambientLight intensity={0.35} />
            <ReconstructionFigure personName={personName} />
            <OrbitControls enablePan={false} minDistance={3} maxDistance={6} enableDamping />
          </Canvas>
        </div>

        <div className="p-5 sm:p-7">
          <p className="text-sm font-medium text-white/40">Conversation</p>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/35">You</p>
            <p className="mt-2 text-base text-white">“{question}”</p>
          </div>
          <div className="mt-3 rounded-xl border border-cyan-300/10 bg-cyan-300/[0.04] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-300/70">{personName}</p>
            <p className="mt-2 text-base leading-7 text-white/80">“{response}”</p>
          </div>

          <div className="mt-5 flex gap-2" role="group" aria-label="Memory evidence mode">
            <button type="button" onClick={() => setEvidence("verified")} aria-pressed={evidence === "verified"} className={`rounded-full px-3 py-2 text-xs ${evidence === "verified" ? "bg-cyan-300 text-slate-950" : "bg-white/5 text-white/60"}`}>Verified memory</button>
            <button type="button" onClick={() => setEvidence("reconstructed")} aria-pressed={evidence === "reconstructed"} className={`rounded-full px-3 py-2 text-xs ${evidence === "reconstructed" ? "bg-amber-300 text-slate-950" : "bg-white/5 text-white/60"}`}>AI reconstruction</button>
          </div>
          <p className="mt-4 text-xs leading-5 text-white/35">AI reconstruction is clearly labeled and must be grounded in preserved evidence. It is never presented as the person's literal words.</p>
        </div>
      </div>
    </section>
  );
}
