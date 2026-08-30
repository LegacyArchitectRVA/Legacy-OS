"use client";

import { FormEvent, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls, Text } from "@react-three/drei";

type Evidence = "verified" | "reconstructed";

type RecreationResult = {
  response: string;
  mode: Evidence;
  disclosure: string;
  evidence: Array<{ id: string; type: string; title: string; evidence: string }>;
};

export interface MemoryRecreationProps {
  personName: string;
  personId?: string;
  question?: string;
  verifiedMemories?: string[];
  reconstructedResponse?: string;
}

function ReconstructionFigure({ personName }: { personName: string }) {
  return (
    <Float speed={0.9} rotationIntensity={0.05} floatIntensity={0.08}>
      <group>
        <mesh position={[0, 0.65, 0]}>
          <sphereGeometry args={[0.48, 48, 48]} />
          <meshBasicMaterial color="#7ee7f2" wireframe transparent opacity={0.75} />
        </mesh>
        <mesh position={[0, -0.35, 0]}>
          <capsuleGeometry args={[0.48, 1.25, 8, 32]} />
          <meshBasicMaterial color="#63c7d8" wireframe transparent opacity={0.55} />
        </mesh>
        <pointLight color="#63c7d8" intensity={8} distance={5} />
        <Text position={[0, -1.25, 0]} fontSize={0.2} color="#b7f5fa" anchorX="center">{personName.toUpperCase()}</Text>
      </group>
    </Float>
  );
}

export default function MemoryRecreation({
  personName,
  personId = "demo-dad",
  question = "What do you remember?",
  verifiedMemories = [],
  reconstructedResponse = "I can only reconstruct a response from preserved memories and evidence.",
}: MemoryRecreationProps) {
  const [evidence, setEvidence] = useState<Evidence>("verified");
  const [prompt, setPrompt] = useState(question);
  const [result, setResult] = useState<RecreationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (evidence === "reconstructed") {
      setResult({ response: reconstructedResponse, mode: "reconstructed", disclosure: "AI reconstruction. This is an interpretation of preserved evidence, not the person's literal words.", evidence: [] });
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const response = await fetch("/api/recall/recreation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personId, prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to recall this memory.");
      setResult(data as RecreationResult);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to recall this memory.");
    } finally {
      setBusy(false);
    }
  }

  const displayed = result?.response ?? verifiedMemories[0] ?? `Ask ${personName} about a preserved memory.`;

  return (
    <section aria-labelledby="memory-recreation-heading" className="overflow-hidden rounded-2xl border border-cyan-200/20 bg-[#020617] text-white shadow-2xl">
      <div className="border-b border-white/10 p-5">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Legacy Recall · Immersive Memory Recreation</p>
        <h2 id="memory-recreation-heading" className="mt-1 text-2xl font-semibold">Talk with {personName}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">Ask about a preserved moment. Legacy Recall uses source material first, then clearly labels anything reconstructed by AI.</p>
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
          <form onSubmit={ask}>
            <label className="text-sm font-medium text-white/50">Ask a memory question<textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none focus:border-cyan-300/60" /></label>
            <button type="submit" disabled={busy} className="mt-3 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-50">{busy ? "Recalling…" : "Recall this moment"}</button>
          </form>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs uppercase tracking-[0.18em] text-white/35">{personName}</p><p className="mt-2 text-base leading-7 text-white/80">“{displayed}”</p></div>
          {result?.evidence.length ? <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-4"><p className="text-xs uppercase tracking-[0.18em] text-white/35">Evidence used</p><ul className="mt-2 space-y-2 text-sm text-white/60">{result.evidence.map((source) => <li key={source.id}>{source.title} · {source.type}</li>)}</ul></div> : null}
          <div className="mt-5 flex gap-2" role="group" aria-label="Memory evidence mode">
            <button type="button" onClick={() => setEvidence("verified")} aria-pressed={evidence === "verified"} className={`rounded-full px-3 py-2 text-xs ${evidence === "verified" ? "bg-cyan-300 text-slate-950" : "bg-white/5 text-white/60"}`}>Verified memory</button>
            <button type="button" onClick={() => setEvidence("reconstructed")} aria-pressed={evidence === "reconstructed"} className={`rounded-full px-3 py-2 text-xs ${evidence === "reconstructed" ? "bg-amber-300 text-slate-950" : "bg-white/5 text-white/60"}`}>AI reconstruction</button>
          </div>
          <p className="mt-4 text-xs leading-5 text-white/35" aria-live="polite">{result?.disclosure ?? "Verified mode uses preserved source material. Reconstructed mode is an AI interpretation, never a claim of the person's literal words."}</p>
          <p className="mt-2 text-xs text-red-300/70" aria-live="polite">{status}</p>
        </div>
      </div>
    </section>
  );
}
