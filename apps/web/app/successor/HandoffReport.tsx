"use client";

import { useEffect, useState } from "react";

interface ReportAction { id: string; title: string; instruction: string; domain: string; state: string }
interface Blocker { action: ReportAction; reason: "dependency" | "evidence" | "blocked" | "completion_invalid"; dependencies: ReportAction[] }
interface Report { ready: boolean; completionPercent: number; blockers: Blocker[]; nextActions: ReportAction[] }

const blockerLabel = (reason: Blocker["reason"]): string => ({
  dependency: "Dependency blocked",
  evidence: "Evidence required",
  blocked: "Explicitly blocked",
  completion_invalid: "Completion needs correction",
}[reason]);

export function HandoffReport({ onSelect }: { onSelect?: (id: string) => void }) {
  const [report, setReport] = useState<Report | null>(null);
  useEffect(() => { let active = true; fetch("/api/successor/handoff/report").then(async (response) => response.ok ? response.json() : null).then((value) => { if (active && value) setReport(value); }).catch(() => undefined); return () => { active = false; }; }, []);
  if (!report) return <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm text-white/40">Building the handoff path…</div>;
  return <section className="mt-6 grid gap-4 lg:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-[#e7b84b]">What is in the way</p><h2 className="mt-1 text-xl font-semibold">{report.blockers.length ? `${report.blockers.length} blocker${report.blockers.length === 1 ? "" : "s"}` : "Nothing blocking the handoff"}</h2></div><span className="text-2xl font-semibold text-[#e7b84b]">{report.completionPercent}%</span></div>{report.blockers.length > 0 && <div className="mt-4 space-y-2">{report.blockers.slice(0, 5).map((blocker) => <button key={blocker.action.id} onClick={() => onSelect?.(blocker.action.id)} className="w-full rounded-lg border border-white/10 bg-black/20 p-3 text-left hover:border-[#e7b84b]/30"><div className="flex items-center justify-between gap-3"><span className="font-medium">{blocker.action.title}</span><span className="text-xs uppercase tracking-wider text-red-300">{blockerLabel(blocker.reason)}</span></div>{blocker.dependencies.length > 0 && <p className="mt-1 text-xs text-white/40">Waiting on: {blocker.dependencies.map((dependency) => dependency.title).join(", ")}</p>}{blocker.reason === "completion_invalid" && <p className="mt-1 text-xs text-red-200/60">This action is marked complete, but one or more completion requirements are not satisfied.</p>}</button>)}</div>}</div><div className="rounded-2xl border border-[#e7b84b]/20 bg-[#100d07] p-5"><p className="text-xs uppercase tracking-[0.2em] text-[#e7b84b]">Do this next</p><h2 className="mt-1 text-xl font-semibold">Your next executable actions</h2>{report.nextActions.length ? <div className="mt-4 space-y-2">{report.nextActions.map((action) => <button key={action.id} onClick={() => onSelect?.(action.id)} className="flex w-full items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-3 text-left hover:border-[#e7b84b]/30"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#e7b84b]/30 text-[#e7b84b]">→</span><span><span className="block font-medium">{action.title}</span><span className="mt-1 block text-xs text-white/40">{action.domain}</span></span></button>)}</div> : <p className="mt-4 text-sm text-white/45">No executable actions are currently available.</p>}</div></section>;
}
