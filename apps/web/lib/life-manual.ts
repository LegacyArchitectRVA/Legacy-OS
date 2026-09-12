import type { ContinuityPillarCoverage, ContinuitySnapshot } from "./continuity";
import type { RecallMemoryRecord } from "./recall";
import type { SuccessorAction } from "./successor-action-types";
import { buildSuccessorHandoff } from "./successor-handoff.ts";

export interface LifeManualPillarSection {
  key: ContinuityPillarCoverage["pillarKey"];
  title: string;
  score: number;
  status: ContinuityPillarCoverage["status"];
  matchedMemories: number;
}

export interface LifeManualActionSection {
  id: string;
  title: string;
  domain: string;
  instruction: string;
  state: SuccessorAction["state"];
  evidenceRequired: boolean;
  evidenceConfirmed: boolean;
  dependencies: string[];
  notes?: string;
}

export interface LifeManualDocument {
  title: "Life Manual";
  generatedAt: string;
  revision: string;
  readiness: { score: number; status: "needs_attention" | "in_progress" | "ready"; gaps: number };
  handoff: {
    ready: boolean;
    completionPercent: number;
    blocked: number;
    evidenceOutstanding: number;
    invalidCompleted: number;
    unresolvedDependencies: number;
    nextAction: {
      actionId: string;
      reason: "unblocks_downstream_work" | "resolve_evidence_gap" | "continue_in_progress";
      downstreamCount: number;
    } | null;
  };
  first72Hours: string[];
  pillars: LifeManualPillarSection[];
  actions: LifeManualActionSection[];
  openIssues: string[];
  importantDecisions: string[];
  memories: Array<{
    id: string;
    context: RecallMemoryRecord["context"];
    title: string;
    narrative: string;
    evidenceClass: RecallMemoryRecord["evidenceClass"];
    provenanceComplete: boolean;
  }>;
}

const PILLAR_TITLES: Record<LifeManualPillarSection["key"], string> = {
  digital_life: "Digital Life",
  financial_assets: "Financial & Assets",
  household_property: "Household & Property",
  health_medical: "Health & Medical",
  vital_records: "Vital Records",
  business_continuity: "Business Continuity",
  legacy_wishes: "Legacy & Wishes",
};

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function buildLifeManualDocument(input: {
  continuity: ContinuitySnapshot;
  pillars: ContinuityPillarCoverage[];
  actions: SuccessorAction[];
  memories: RecallMemoryRecord[];
  revision?: string;
  generatedAt?: string;
}): LifeManualDocument {
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const revision = input.revision ?? generatedAt.slice(0, 10);
  const handoff = buildSuccessorHandoff(input.actions);
  const actionById = new Map(input.actions.map((action) => [action.id, action]));

  const pillars = input.pillars.map((pillar) => ({
    key: pillar.pillarKey,
    title: PILLAR_TITLES[pillar.pillarKey],
    score: pillar.coverageScore,
    status: pillar.status,
    matchedMemories: pillar.matchedMemories,
  }));

  const actions = input.actions.map((action) => ({
    id: action.id,
    title: action.title,
    domain: action.domain,
    instruction: action.instruction,
    state: action.state,
    evidenceRequired: action.evidenceRequired,
    evidenceConfirmed: Boolean(action.evidenceConfirmed),
    dependencies: unique(action.dependencies),
    ...(action.notes?.trim() ? { notes: action.notes.trim() } : {}),
  }));

  const openIssues = unique([
    ...input.continuity.gaps.map((gap) => `${gap.title}: ${gap.reason}`),
    ...handoff.blockedActions.map((action) => `${action.title}: blocked`),
    ...handoff.evidenceOutstanding.map((action) => `${action.title}: evidence required`),
    ...handoff.invalidCompletedActions.map((action) => `${action.title}: completed status needs correction`),
    ...handoff.unresolvedDependencies.map(({ actionId, dependencyId }) => {
      const action = actionById.get(actionId);
      const dependency = actionById.get(dependencyId);
      return `${action?.title ?? actionId}: waiting on ${dependency?.title ?? dependencyId}`;
    }),
  ]);

  const importantDecisions = unique(
    input.memories
      .filter((memory) => memory.context === "family" || memory.context === "business")
      .filter((memory) => memory.evidenceClass !== "unknown")
      .map((memory) => memory.narrative),
  );

  const firstAction = handoff.nextAction ? actionById.get(handoff.nextAction.actionId) : undefined;
  const readyActions = handoff.actionReadiness
    .filter((item) => item.ready && item.actionId !== handoff.nextAction?.actionId)
    .sort((a, b) => a.title.localeCompare(b.title));

  const first72Hours = unique([
    ...(firstAction
      ? [handoff.nextAction?.reason === "resolve_evidence_gap" ? `Resolve evidence for ${firstAction.title}.` : firstAction.instruction]
      : []),
    ...readyActions.slice(0, 4).map((item) => item.instruction),
    ...handoff.evidenceOutstanding
      .filter((action) => action.id !== handoff.nextAction?.actionId)
      .slice(0, 2)
      .map((action) => `Resolve evidence for ${action.title}.`),
    ...handoff.blockedActions.slice(0, 2).map((action) => `Address the blocker for ${action.title}.`),
    ...handoff.invalidCompletedActions.slice(0, 2).map((action) => `Correct the completion status for ${action.title}.`),
    ...openIssues.slice(0, 3),
  ]).slice(0, 10);

  const status = input.continuity.readiness >= 80 ? "ready" : input.continuity.readiness >= 40 ? "in_progress" : "needs_attention";

  return {
    title: "Life Manual",
    generatedAt,
    revision,
    readiness: { score: input.continuity.readiness, status, gaps: openIssues.length },
    handoff: {
      ready: handoff.ready,
      completionPercent: handoff.completionPercent,
      blocked: handoff.blockedActions.length,
      evidenceOutstanding: handoff.evidenceOutstanding.length,
      invalidCompleted: handoff.invalidCompletedActions.length,
      unresolvedDependencies: handoff.unresolvedDependencies.length,
      nextAction: handoff.nextAction,
    },
    first72Hours: first72Hours.length > 0 ? first72Hours : ["Review the seven pillars and confirm the most important unresolved information."],
    pillars,
    actions,
    openIssues,
    importantDecisions,
    memories: input.memories.map((memory) => ({
      id: memory.id,
      context: memory.context,
      title: memory.title,
      narrative: memory.narrative,
      evidenceClass: memory.evidenceClass,
      provenanceComplete: memory.provenanceComplete,
    })),
  };
}
