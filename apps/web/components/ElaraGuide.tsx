"use client";

import { useState } from "react";
import { ELARA } from "./elara-config";

export function ElaraAvatar({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full border border-[#e7b84b]/45 bg-[#110d09] shadow-[0_0_35px_rgba(231,184,75,0.12)] ${compact ? "h-14 w-14" : "h-24 w-24"}`} aria-label="Elara, Legacy OS Guide">
      <div className="absolute inset-[-18%] bg-[radial-gradient(circle_at_50%_24%,#c75b32_0_27%,transparent_28%),radial-gradient(circle_at_28%_35%,#8e3d28_0_22%,transparent_23%),radial-gradient(circle_at_72%_35%,#8e3d28_0_22%,transparent_23%)]" />
      <div className="absolute left-1/2 top-[21%] h-[58%] w-[54%] -translate-x-1/2 rounded-[48%] bg-[#f1c7a9] shadow-[inset_-5px_-5px_12px_rgba(120,60,45,0.12)]" />
      <div className="absolute left-[31%] top-[42%] h-[8%] w-[8%] rounded-full bg-[#315c3e]" />
      <div className="absolute right-[31%] top-[42%] h-[8%] w-[8%] rounded-full bg-[#315c3e]" />
      <div className="absolute left-[42%] top-[57%] h-[3%] w-[16%] rounded-full border-b border-[#8c5146]" />
      <div className="absolute left-[18%] top-[62%] h-[20%] w-[64%] rounded-t-[50%] bg-[#7e3826]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_48%,rgba(173,84,58,0.65)_0_1px,transparent_2px),radial-gradient(circle_at_63%_50%,rgba(173,84,58,0.65)_0_1px,transparent_2px),radial-gradient(circle_at_47%_46%,rgba(173,84,58,0.5)_0_1px,transparent_2px)] opacity-80" />
    </div>
  );
}

export function ElaraGuide() {
  const [speaking, setSpeaking] = useState(false);
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#e7b84b]/25 bg-gradient-to-br from-[#171108] via-[#0b0b0b] to-[#050505] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#e7b84b]/[0.06] blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <ElaraAvatar />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-serif text-2xl text-white">{ELARA.name}</p>
            <span className="rounded-full border border-[#e7b84b]/30 bg-[#e7b84b]/10 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[#e7b84b]">Default Guide</span>
          </div>
          <p className="mt-1 text-sm text-white/50">{ELARA.role}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">I&apos;m here to help you understand what matters, find what&apos;s missing, and move through your continuity plan without the usual maze of binders, passwords, and unanswered questions.</p>
        </div>
        <button type="button" onClick={() => setSpeaking((value) => !value)} className="rounded-lg border border-[#e7b84b]/35 px-4 py-2 text-sm text-[#f0c85a] hover:bg-[#e7b84b]/10" aria-pressed={speaking}>
          {speaking ? "Pause Elara" : "Talk to Elara"}
        </button>
      </div>
      {speaking && <div className="relative mt-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white/45">Voice profile: soft, breathy, warm and calm, with an Irish-inspired delivery. Audio playback will connect to the OS voice service.</div>}
    </section>
  );
}
