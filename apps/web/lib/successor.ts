export type SuccessorActionStatus = "ready" | "needs_review" | "blocked";

export interface SuccessorItem { id: string; title: string; domain: string; instruction: string; status: SuccessorActionStatus; evidenceRequired: boolean; dependencies: string[]; }

export interface SuccessorBrief { generatedAt: string; readiness: number; items: SuccessorItem[]; unknowns: string[]; warnings: string[]; }

type Action = { id: string; domain: string; title: string; reason: string; priority: string; status: string; dependsOn?: string[]; evidenceRequired?: boolean };

type Memory = { id: string; title: string; narrative: string; evidenceClass?: string; provenanceComplete?: boolean; sourceRefs?: string[] };

export function buildSuccessorBrief(actions: Action[], memories: Memory[], readiness: number): SuccessorBrief {
  const items: SuccessorItem[] = actions.map((action) => ({ id: action.id, title: action.title, domain: action.domain, instruction: action.reason, status: action.status === "complete" ? "ready" : action.evidenceRequired ? "needs_review" : "blocked", evidenceRequired: Boolean(action.evidenceRequired), dependencies: action.dependsOn ?? [] }));
  const unknowns = memories.filter((memory) => memory.evidenceClass === "unknown").map((memory) => memory.title);
  const warnings = memories.filter((memory) => memory.provenanceComplete === false || !memory.sourceRefs?.length).map((memory) => `${memory.title}: supporting provenance is incomplete.`);
  return { generatedAt: new Date().toISOString(), readiness, items, unknowns: [...new Set(unknowns)], warnings: [...new Set(warnings)] };
}
