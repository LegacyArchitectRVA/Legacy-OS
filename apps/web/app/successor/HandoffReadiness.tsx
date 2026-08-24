"use client";

import { useEffect, useState } from "react";
import { HandoffReport } from "./HandoffReport";

interface HandoffReadiness {
  ready: boolean;
  completionPercent: number;
  openActions: number;
  blockedActions: number;
  inProgressActions: number;
  completedActions: number;
  unresolvedDependencies: string[];
  outstandingEvidence: string[];
}

export function HandoffReadiness({ onSelectAction }: { onSelectAction?: (actionId: string) => void }) {
  const [data, setData] = useState<HandoffReadiness | null>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/successor/handoff").then(async (response) => response.ok ? response.json() : null).then((value) => { if (active && value) setData(value); }).catch(() => undefined);
    return () => { active = false; };
  }, []);
  if (!data) return <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm text-white/40">Checking handoff readiness…</div>;
  const issues = [...data.unresolvedDependencies, ...data.outstandingEvidence];
  return <>
    <section className={`rounded-2xl border p-5 ${data.ready ? "border-emerald-400/25 bg-emerald-400/[0.04]" : "border-[#e7b84b]/25 bg-[#e7b84b]/[0.04]"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-[#e7b84b]">Handoff Readiness</p><h2 className="mt-1 text-xl font-semibold">{data.ready ? "Ready for a clean handoff" : "Handoff needs attention"}</h2></div><div className="text-right"><div className="text-3xl font-semibold">{data.completionPercent}%</div><div className="text-xs text-white/40">complete</div></div></div>
      {!data.ready && <div className="mt-5"><p className="text-sm text-white/55">Resolve these items before treating the workspace as successor-ready.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{issues.slice(0, 8).map((issue) => <button key={issue} onClick={() => onSelectAction?.(issue)} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-left text-sm text-white/60 hover:border-[#e7b84b]/30">{issue}</button>)}</div></div>}
    </section>
    <HandoffReport onSelect={onSelectAction} />
  </>;
}
