import type { ContinuityPillarCoverage, ContinuitySnapshot } from "./continuity";
import type { RecallMemoryRecord } from "./recall";
import type { SuccessorAction } from "./successor-action-types";

export interface LifeManualPillarSection {
  key: ContinuityPillarCoverage["key"];
  title: string;
  score: number;
  status: ContinuityPillarCoverage["status"];
  gaps: string[];
  matchedMemoryIds: string[];
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
  readiness: {
    score: number;
    status: string;
    gaps: number;
  };
  first72Hours: string[];
  pillars: LifeManualPillarSection[];
  actions: LifeManualActionSection[];
  openIssues: string[];
  importantDecisions: string[];
  memories: Array<{
    id: string;
    context: RecallMemoryRecord["context"];
    text: string;
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

  const pillars = input.pillars.map((pillar) => ({
    key: pillar.key,
    title: PILLAR_TITLES[pillar.key],
    score: pillar.score,
    status: pillar.status,
    gaps: unique(pillar.gaps.map((gap) => gap.label)),
    matchedMemoryIds: unique(pillar.matchedMemoryIds),
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
    ...input.continuity.gaps.map((gap) => gap.description),
    ...actions
      .filter((action) => action.state === "blocked" || (action.evidenceRequired && !action.evidenceConfirmed))
      .map((action) => `${action.title}: ${action.evidenceRequired && !action.evidenceConfirmed ? "evidence required" : "blocked"}`),
  ]);

  const importantDecisions = unique(
    input.memories
      .filter((memory) => memory.context === "family" || memory.context === "business")
      .filter((memory) => memory.evidenceClass !== "unknown")
      .map((memory) => memory.text),
  );

  const first72Hours = unique([
    ...actions.filter((action) => action.state !== "complete").slice(0, 7).map((action) => action.instruction),
    ...openIssues.slice(0, 3),
  ]).slice(0, 10);

  return {
    title: "Life Manual",
    generatedAt,
    revision,
    readiness: {
      score: input.continuity.score,
      status: input.continuity.status,
      gaps: openIssues.length,
    },
    first72Hours: first72Hours.length > 0 ? first72Hours : ["Review the seven pillars and confirm the most important unresolved information."],
    pillars,
    actions,
    openIssues,
    importantDecisions,
    memories: input.memories.map((memory) => ({
      id: memory.id,
      context: memory.context,
      text: memory.text,
      evidenceClass: memory.evidenceClass,
      provenanceComplete: memory.provenanceComplete,
    })),
  };
}
