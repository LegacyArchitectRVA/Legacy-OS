"use client";

import { useState } from "react";

type Mode = "original" | "merge" | "restore" | "holographic";

const modes: { id: Mode; label: string; detail: string }[] = [
  { id: "original", label: "Original", detail: "Show the source exactly as received." },
  { id: "merge", label: "Merge", detail: "Blend available source evidence into a unified view." },
  { id: "restore", label: "Restore", detail: "Use available restoration processing for degraded media." },
  { id: "holographic", label: "Holographic", detail: "Present an authorized visual reconstruction." },
];

export default function VisualRecallPanel() {
  const [mode, setMode] = useState<Mode>("original");
  const [reconstructionAvailable, setReconstructionAvailable] = useState(false);
  const reconstructionMode = mode === "restore" || mode === "merge" || mode === "holographic";
  const displayedMode = reconstructionMode && !reconstructionAvailable ? "original" : mode;
  const displayedLabel = modes.find((item) => item.id === displayedMode)?.label ?? "Original";

  return (
    <section className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-2xl backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Echo Visual Recall</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">See the memory, choose the view.</h2>
          <p className="mt-2 max-w-2xl text-sm text-white/60">
            Original media remains available independently from reconstruction. If restoration, merging, or holographic reconstruction is unavailable, Echo falls back to the authorized original.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/60">Image / Video / Scene</span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        {modes.map((item) => {
          const active = item.id === mode;
          const unavailable = item.id !== "original" && !reconstructionAvailable;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setMode(item.id)}
              className={`rounded-xl border p-4 text-left transition ${active ? "border-cyan-300/70 bg-cyan-300/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}
              aria-pressed={active}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-white">{item.label}</span>
                {unavailable && <span className="text-[10px] uppercase tracking-wider text-white/40">Fallback</span>}
              </div>
              <p className="mt-2 text-xs leading-5 text-white/50">{item.detail}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/50">Current presentation</span>
          <span className="font-medium text-cyan-200">{displayedLabel}</span>
        </div>
        <div className="mt-4 flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-950">
          {displayedMode === "holographic" ? (
            <div className="text-center text-cyan-200">
              <div className="mx-auto h-24 w-24 animate-pulse rounded-full border border-cyan-300/60 shadow-[0_0_60px_rgba(103,232,249,.35)]" />
              <p className="mt-4 text-sm">Holographic reconstruction</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto h-20 w-28 rounded-lg border border-white/15 bg-white/5" />
              <p className="mt-4 text-sm text-white/60">{displayedLabel} media view</p>
            </div>
          )}
        </div>
        {reconstructionMode && !reconstructionAvailable && (
          <p className="mt-3 text-xs text-amber-200/80">Reconstruction isn't currently available, so the authorized original remains visible.</p>
        )}
        <button
          type="button"
          onClick={() => setReconstructionAvailable((value) => !value)}
          className="mt-4 text-xs text-white/40 underline underline-offset-4 hover:text-white/70"
        >
          Demo: toggle reconstruction availability
        </button>
      </div>
    </section>
  );
}
