"use client";

import { useMemo, useState } from "react";

type Evidence = { kind: string; title: string; source: string };

const memory = {
  title: "Fishing at Smith Mountain Lake",
  location: "Smith Mountain Lake, Virginia",
  subject: "Dad",
  narrative:
    "I remember that afternoon on the lake. We thought we were going to catch everything out there, and somehow we spent more time laughing than fishing.",
  confidence: 0.97,
  evidence: [
    { kind: "PHOTO", title: "Dad and the boat", source: "photo:2004" },
    { kind: "VIDEO", title: "Fishing trip video", source: "video:2004" },
  ] satisfies Evidence[],
};

export default function EchoPage() {
  const [playing, setPlaying] = useState(false);
  const [showEvidence, setShowEvidence] = useState(true);
  const progress = useMemo(() => (playing ? 68 : 0), [playing]);

  return (
    <main className="min-h-screen bg-[#080a0d] text-white">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <header className="flex items-center justify-between border-b border-white/10 pb-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.28em] text-white/45">LEGACYOS</p>
            <h1 className="mt-1 text-xl font-medium tracking-tight">Echo</h1>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/55">
            AI representation · Evidence grounded
          </div>
        </header>

        <section className="grid min-h-[720px] gap-5 py-6 lg:grid-cols-[1fr_360px]">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_50%_25%,#304044,transparent_42%),linear-gradient(145deg,#121820,#080b0f)]">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] [background-size:48px_48px]" />
            <div className="relative flex h-full min-h-[720px] flex-col justify-between p-6 sm:p-10">
              <div className="flex justify-between">
                <div>
                  <p className="text-xs tracking-[0.22em] text-white/45">MEMORY EXPERIENCE</p>
                  <h2 className="mt-2 text-2xl font-medium">{memory.title}</h2>
                  <p className="mt-1 text-sm text-white/45">{memory.location}</p>
                </div>
                <div className="h-fit rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs text-white/50">
                  97% confidence
                </div>
              </div>

              <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
                <div className="relative mb-8 flex h-72 w-72 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] shadow-2xl shadow-black/50">
                  <div className="absolute inset-5 rounded-full border border-white/10" />
                  <div className="absolute inset-10 rounded-full bg-white/[0.035] blur-xl" />
                  <div className="relative flex h-52 w-40 items-center justify-center rounded-[45%] bg-gradient-to-b from-white/20 via-white/8 to-transparent shadow-[0_0_80px_rgba(170,210,210,.12)]">
                    <div className="text-center">
                      <div className="mx-auto mb-3 h-20 w-16 rounded-[45%] border border-white/20 bg-white/[0.08]" />
                      <p className="text-sm text-white/65">Dad</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/30">Echo representation</p>
                    </div>
                  </div>
                </div>

                <p className="max-w-2xl text-lg leading-8 text-white/80">“{memory.narrative}”</p>
                <div className="mt-7 flex items-center gap-3">
                  <button
                    onClick={() => setPlaying(!playing)}
                    className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
                  >
                    {playing ? "Pause memory" : "Experience memory"}
                  </button>
                  <button
                    onClick={() => setShowEvidence(!showEvidence)}
                    className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm text-white/70 hover:bg-white/[0.07]"
                  >
                    {showEvidence ? "Hide evidence" : "Show evidence"}
                  </button>
                </div>
              </div>

              <div>
                <div className="mb-3 flex justify-between text-xs text-white/35">
                  <span>{playing ? "Reconstructing memory" : "Ready"}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1 rounded-full bg-white/10">
                  <div className="h-1 rounded-full bg-white/65 transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Evidence</h3>
              <span className="text-xs text-white/35">{memory.evidence.length} sources</span>
            </div>

            {showEvidence && (
              <div className="mt-5 space-y-3">
                {memory.evidence.map((item) => (
                  <div key={item.source} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold tracking-[0.18em] text-white/35">{item.kind}</span>
                      <span className="text-[10px] text-white/25">{item.source}</span>
                    </div>
                    <div className="mt-7 h-24 rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.08] to-transparent" />
                    <p className="mt-3 text-sm text-white/65">{item.title}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-white/35">PROVENANCE</p>
              <div className="mt-3 space-y-2 text-xs text-white/45">
                <p>Knowledge state: <span className="text-white/70">Known</span></p>
                <p>Subject: <span className="text-white/70">{memory.subject}</span></p>
                <p>Environment: <span className="text-white/70">Reconstructed</span></p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-xs leading-5 text-white/40">
              The avatar is an AI representation. The story is grounded in cited evidence. Environmental details may be reconstructed and are not presented as historical fact.
            </div>
          </aside>
        </section>

        <footer className="border-t border-white/10 py-5 text-center text-xs tracking-[0.16em] text-white/25">
          LET YOUR LEGACY ECHO
        </footer>
      </div>
    </main>
  );
}
