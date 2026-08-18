"use client";

import { useState } from "react";

type Context = "personal" | "family" | "business";

const contexts: { id: Context; label: string; description: string; focus: string }[] = [
  {
    id: "personal",
    label: "Personal",
    description: "Your life, responsibilities, memories, relationships, property, and decisions.",
    focus: "Life continuity",
  },
  {
    id: "family",
    label: "Family",
    description: "Shared knowledge, family history, important instructions, and memories.",
    focus: "Family continuity",
  },
  {
    id: "business",
    label: "Business",
    description: "Knowledge, systems, responsibilities, workflows, and operational dependencies.",
    focus: "Business continuity",
  },
];

export default function LegacyContextSelector() {
  const [context, setContext] = useState<Context>("personal");
  const active = contexts.find((item) => item.id === context) ?? contexts[0];

  return (
    <section aria-labelledby="context-heading" className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.04] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Continuity context</p>
          <h2 id="context-heading" className="mt-1 text-xl font-semibold">What are you protecting?</h2>
          <p className="mt-1 text-sm text-white/50">LegacyOS adapts the experience to the part of life you are working on.</p>
        </div>
        <span className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-200">{active.focus}</span>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {contexts.map((item) => {
          const selected = item.id === context;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setContext(item.id)}
              aria-pressed={selected}
              className={`rounded-xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${selected ? "border-cyan-300/60 bg-cyan-300/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-white">{item.label}</span>
                <span className="text-xs text-white/30">{selected ? "Selected" : "Select"}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/50">{item.description}</p>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-white/40" aria-live="polite">
        Current context: <span className="text-white/70">{active.label}</span>. Your source information remains separate from this display preference.
      </p>
    </section>
  );
}
