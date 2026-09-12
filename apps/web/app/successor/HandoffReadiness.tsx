"use client";

import { useEffect, useState } from "react";
import { HandoffReport } from "./HandoffReport";

interface HandoffActionReadiness { actionId: string; ready: boolean; unresolvedDependencies: string[]; evidenceRequired: boolean; evidenceConfirmed: boolean; reason: "ready" | "explicitly_blocked" | "dependency_blocked" | "evidence_required" | "completed"; }
interface HandoffNextAction { actionId: string; reason: "unblocks_downstream_work" | "continue_in_progress"; downstreamCount: number; }
interface HandoffReadiness { ready: boolean; completionPercent: number; openActions: number; blockedActions: number; inProgressActions: number; completedActions: number; unresolvedDependencies: Array<{ actionId: string; dependencyId: string }>; evidenceOutstanding: Array<{ id: string; title: string; domain: string }>; actionReadiness: HandoffActionReadiness[]; nextAction: HandoffNextAction | null; }
interface Pillar { pillar_key: string; name: string; coverage_score: number; status: "needs_attention" | "in_progress" | "ready"; matched_memories?: number; }
interface EngineAction { id: string; title: string; domain: string; reason: string; priority: "critical" | "important" | "routine"; }
interface Intelligence { overallRisk: "critical" | "elevated" | "watch" | "low"; confidenceScore: number; freshnessScore: number; evidenceQualityScore: number; staleEvidenceCount: number; topRisks: Array<{ pillarKey: string; level: string; score: number; reason: string; nextAction: string }>; nextBestAction: string | null; }

const readinessReason = (reason: HandoffActionReadiness["reason"]): string => ({
  ready: "Ready to start",
  explicitly_blocked: "Explicitly blocked",
  dependency_blocked: "Waiting on another action",
  evidence_required: "Evidence required",
  completed: "Completed",
}[reason]);

export function HandoffReadiness({ onSelectAction }: { onSelectAction?: (actionId: string) => void }) {
  const [data, setData] = useState<HandoffReadiness | null>(null);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [engineActions, setEngineActions] = useState<EngineAction[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [intelligence, setIntelligence] = useState<Intelligence | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/successor/handoff", { cache: "no-store" }).then(async (response) => response.ok ? response.json() : null),
      fetch("/api/continuity/engine", { cache: "no-store" }).then(async (response) => response.ok ? response.json() : null),
    ]).then(([handoff, engine]) => {
      if (!active) return;
      if (handoff) setData(handoff);
      if (Array.isArray(engine?.pillars)) setPillars(engine.pillars);
      if (Array.isArray(engine?.actions)) setEngineActions(engine.actions);
      if (typeof engine?.readiness?.overall_score === "number") setOverallScore(engine.readiness.overall_score);
      if (engine?.intelligence && typeof engine.intelligence.confidenceScore === "number") setIntelligence(engine.intelligence);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  if (!data) return <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 text-sm text-white/40">Checking handoff readiness…</div>;

  const actionTitle = (actionId: string) => data.actionReadiness.find((action) => action.actionId === actionId)?.actionId ?? actionId;
  const dependencyIssues = data.unresolvedDependencies.map((issue) => ({ key: `dependency:${issue.actionId}:${issue.dependencyId}`, actionId: issue.actionId, label: `Waiting on ${actionTitle(issue.dependencyId)}` }));
  const evidenceIssues = data.evidenceOutstanding.map((action) => ({ key: `evidence:${action.id}`, actionId: action.id, label: `Evidence needed: ${action.title}` }));
  const blockedIssues = data.actionReadiness.filter((action) => action.reason === "explicitly_blocked").map((action) => ({ key: `blocked:${action.actionId}`, actionId: action.actionId, label: "Explicitly blocked: action must be unblocked" }));
  const issues = [...blockedIssues, ...dependencyIssues, ...evidenceIssues];
  const nextAction = data.nextAction ? data.actionReadiness.find((action) => action.actionId === data.nextAction?.actionId) : null;
  const riskLabel = intelligence?.overallRisk === "critical" ? "Critical continuity risk" : intelligence?.overallRisk === "elevated" ? "Elevated continuity risk" : intelligence?.overallRisk === "watch" ? "Continuity watch" : "Low continuity risk";

  return <>
    <section className={`rounded-2xl border p-5 ${data.ready ? "border-emerald-400/25 bg-emerald-400/[0.04]" : "border-[#e7b84b]/25 bg-[#e7b84b]/[0.04]"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-[#e7b84b]">Handoff Readiness</p><h2 className="mt-1 text-xl font-semibold">{data.ready ? "Ready for a clean handoff" : "Handoff needs attention"}</h2></div><div className="text-right"><div className="text-3xl font-semibold">{data.completionPercent}%</div><div className="text-xs text-white/40">complete</div></div></div>
      {nextAction && <div className="mt-5 rounded-xl border border-[#e7b84b]/30 bg-[#e7b84b]/[0.07] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-[#e7b84b]">Do this next</p><h3 className="mt-1 text-lg font-semibold">{actionTitle(nextAction.actionId)}</h3><p className="mt-1 text-sm text-white/50">{data.nextAction?.reason === "unblocks_downstream_work" ? `Completing this unblocks ${data.nextAction.downstreamCount} downstream ${data.nextAction.downstreamCount === 1 ? "action" : "actions"}.` : "This action is already in progress and is the next executable step."}</p></div><button onClick={() => onSelectAction?.(nextAction.actionId)} className="rounded-lg border border-[#e7b84b]/30 px-3 py-2 text-sm text-[#e7b84b] hover:bg-[#e7b84b]/10">Open action</button></div></div>}
      {!data.ready && <div className="mt-5"><p className="text-sm text-white/55">Resolve these items before treating the workspace as successor-ready.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{issues.slice(0, 8).map((issue) => <button key={issue.key} onClick={() => onSelectAction?.(issue.actionId)} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-left text-sm text-white/60 hover:border-[#e7b84b]/30">{issue.label}</button>)}</div></div>}
      <div className="mt-5 border-t border-white/10 pt-4"><div className="flex items-center justify-between"><p className="text-sm font-medium">Action readiness</p><span className="text-xs text-white/30">{data.actionReadiness.length} actions evaluated</span></div><div className="mt-3 grid gap-2 sm:grid-cols-2">{data.actionReadiness.slice(0, 8).map((action) => <button key={action.actionId} onClick={() => onSelectAction?.(action.actionId)} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-left hover:border-[#e7b84b]/30"><span className="min-w-0 truncate text-sm text-white/65">{action.actionId}</span><span className="shrink-0 text-[11px] uppercase tracking-wide text-white/35">{readinessReason(action.reason)}</span></button>)}</div></div>
    </section>

    <section className="mt-6 rounded-2xl border border-[#e7b84b]/20 bg-gradient-to-br from-[#171207] to-[#0b0b0b] p-5">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-[#e7b84b]">Continuity Engine</p><h2 className="mt-1 text-xl font-semibold">What is actually covered?</h2><p className="mt-1 text-sm text-white/40">Calculated from stored continuity evidence.</p></div><div className="text-right"><div className="text-3xl font-semibold">{overallScore}%</div><div className="text-xs text-white/35">overall readiness</div></div></div>
      {intelligence && <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-xl border border-white/10 p-3"><p className="text-[11px] uppercase tracking-wide text-white/35">Risk</p><p className="mt-1 text-sm font-semibold">{riskLabel}</p></div><div className="rounded-xl border border-white/10 p-3"><p className="text-[11px] uppercase tracking-wide text-white/35">Confidence</p><p className="mt-1 text-sm font-semibold">{intelligence.confidenceScore}%</p></div><div className="rounded-xl border border-white/10 p-3"><p className="text-[11px] uppercase tracking-wide text-white/35">Evidence quality</p><p className="mt-1 text-sm font-semibold">{intelligence.evidenceQualityScore}%</p></div><div className="rounded-xl border border-white/10 p-3"><p className="text-[11px] uppercase tracking-wide text-white/35">Stale evidence</p><p className="mt-1 text-sm font-semibold">{intelligence.staleEvidenceCount}</p></div></div>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{pillars.map((pillar) => <div key={pillar.pillar_key} className={`rounded-xl border p-3 ${pillar.status === "ready" ? "border-emerald-400/20 bg-emerald-400/[0.04]" : pillar.status === "in_progress" ? "border-blue-400/20 bg-blue-400/[0.04]" : "border-red-400/20 bg-red-400/[0.04]"}`}><div className="flex justify-between gap-2"><span className="text-sm font-medium">{pillar.name}</span><span className="text-sm font-semibold">{pillar.coverage_score}%</span></div><div className="mt-2 h-1.5 rounded-full bg-white/10"><div className="h-full rounded-full bg-[#e7b84b]" style={{ width: `${pillar.coverage_score}%` }} /></div><p className="mt-2 text-[11px] text-white/35">{pillar.matched_memories ?? 0} evidence items</p></div>)}</div>
      {intelligence?.topRisks.length ? <div className="mt-4 border-t border-white/10 pt-4"><div className="flex items-center justify-between"><p className="text-sm font-medium">Highest continuity risks</p><span className="text-xs text-white/30">{intelligence.topRisks.length} ranked</span></div><div className="mt-2 grid gap-2">{intelligence.topRisks.slice(0, 3).map((risk) => <div key={risk.pillarKey} className="rounded-lg border border-white/10 px-3 py-2"><div className="flex items-center justify-between gap-3"><span className="text-sm">{risk.reason}</span><span className="text-[11px] uppercase text-[#e7b84b]">{risk.level}</span></div><p className="mt-1 text-xs text-white/35">Next: {risk.nextAction}</p></div>)}</div></div> : null}
      {intelligence?.nextBestAction && <div className="mt-4 rounded-lg border border-[#e7b84b]/20 bg-[#e7b84b]/[0.04] px-3 py-2"><p className="text-[11px] uppercase tracking-wide text-[#e7b84b]">Next best action</p><p className="mt-1 text-sm text-white/70">{intelligence.nextBestAction}</p></div>}
      {engineActions.length > 0 && <div className="mt-4 border-t border-white/10 pt-4"><div className="flex items-center justify-between"><p className="text-sm font-medium">Next gaps</p><span className="text-xs text-white/30">{engineActions.length} generated</span></div><div className="mt-2 grid gap-2">{engineActions.slice(0, 4).map((action) => <div key={action.id} className="rounded-lg border border-white/10 px-3 py-2"><div className="flex items-center justify-between gap-3"><span className="text-sm">{action.title}</span><span className="text-[11px] uppercase text-[#e7b84b]">{action.priority}</span></div><p className="mt-1 text-xs text-white/35">{action.domain} · {action.reason}</p></div>)}</div></div>}
    </section>

    <HandoffReport onSelect={onSelectAction} />
  </>;
}
