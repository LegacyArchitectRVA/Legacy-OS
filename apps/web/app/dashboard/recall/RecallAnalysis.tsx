"use client";

import { useState } from "react";

type Analysis = { memoryCount: number; relationships: Array<{ fromId: string; toId: string; kinds: string[]; score: number }>; conflicts: Array<{ memoryIds: string[]; reason: string; severity: string }> };

export default function RecallAnalysis() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [status, setStatus] = useState("");
  async function run() {
    setStatus("Analyzing…");
    const response = await fetch("/api/recall/analysis");
    const data = await response.json();
    if (!response.ok) { setStatus(data.error ?? "Analysis failed."); return; }
    setAnalysis(data); setStatus("Analysis complete.");
  }
  return <section className="mt-8 rounded-xl border p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-xl font-semibold">Recall analysis</h2><p className="mt-1 text-sm text-muted-foreground">Find connected memories and possible contradictions without treating either as fact.</p></div><button onClick={run} className="rounded-md border px-4 py-2 text-sm">Analyze</button></div><p className="mt-2 text-sm text-muted-foreground" aria-live="polite">{status}</p>{analysis && <div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-lg border p-4"><div className="text-2xl font-semibold">{analysis.memoryCount}</div><div className="text-sm text-muted-foreground">Memories analyzed</div></div><div className="rounded-lg border p-4"><div className="text-2xl font-semibold">{analysis.relationships.length}</div><div className="text-sm text-muted-foreground">Relationships found</div></div><div className="rounded-lg border p-4"><div className="text-2xl font-semibold">{analysis.conflicts.length}</div><div className="text-sm text-muted-foreground">Items needing review</div></div></div>}{analysis?.conflicts.length ? <div className="mt-5 space-y-3">{analysis.conflicts.map((conflict, index) => <article key={`${conflict.memoryIds.join("-")}-${index}`} className="rounded-lg border p-4"><span className="text-xs uppercase tracking-wide text-muted-foreground">{conflict.severity}</span><p className="mt-1 text-sm">{conflict.reason}</p></article>)}</div> : null}</section>;
}
