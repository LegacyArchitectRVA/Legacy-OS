"use client";

import { useState } from "react";

type RecallMode = "original" | "merge" | "restore" | "holographic";
type MediaKind = "image" | "video" | "scene";

interface HolographicRecallViewerProps {
  sourceUri?: string;
  mediaKind?: MediaKind;
  reconstructionAvailable?: boolean;
}

const modes: RecallMode[] = ["original", "merge", "restore", "holographic"];

export default function HolographicRecallViewer({
  sourceUri,
  mediaKind = "image",
  reconstructionAvailable = false,
}: HolographicRecallViewerProps) {
  const [mode, setMode] = useState<RecallMode>("original");
  const effectiveMode = mode === "original" || reconstructionAvailable ? mode : "original";

  return (
    <section className="overflow-hidden rounded-2xl border border-cyan-300/20 bg-slate-950 shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">Echo Recall Viewer</p>
          <p className="mt-1 text-sm text-white/60">{mediaKind} · {effectiveMode}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {modes.map((item) => {
            const unavailable = item !== "original" && !reconstructionAvailable;
            return (
              <button key={item} type="button" onClick={() => setMode(item)} aria-pressed={mode === item}
                className={`rounded-full px-3 py-1.5 text-xs capitalize transition ${mode === item ? "bg-cyan-300 text-slate-950" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>
                {item}{unavailable ? " · fallback" : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative aspect-video overflow-hidden bg-[radial-gradient(circle_at_center,rgba(34,211,238,.16),transparent_55%),linear-gradient(135deg,#020617,#0f172a)]">
        {effectiveMode === "holographic" ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative h-52 w-52 animate-pulse rounded-full border border-cyan-200/60 shadow-[0_0_100px_rgba(34,211,238,.35)]">
              <div className="absolute inset-6 rounded-full border border-cyan-300/30" />
              <div className="absolute inset-12 rounded-full border border-cyan-300/20" />
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-cyan-300/20" />
              <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-cyan-300/20" />
            </div>
            <div className="absolute bottom-5 left-0 right-0 text-center text-xs text-cyan-100/70">Authorized reconstruction presentation</div>
          </div>
        ) : sourceUri ? (
          mediaKind === "video" ? <video src={sourceUri} controls className="h-full w-full object-contain" /> : <img src={sourceUri} alt="Echo recalled media" className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/40">No source media supplied</div>
        )}
      </div>

      {mode !== effectiveMode && <p className="border-t border-amber-300/10 bg-amber-300/5 px-4 py-3 text-xs text-amber-100/70">Reconstruction isn't currently available. Echo is showing the authorized original instead.</p>}
    </section>
  );
}
