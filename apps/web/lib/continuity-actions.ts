export type ActionPriority = "critical" | "important" | "routine";
export type ActionStatus = "open" | "in_progress" | "blocked" | "complete";

export interface ContinuityAction { id: string; domain: string; title: string; reason: string; priority: ActionPriority; status: ActionStatus; dependsOn: string[]; evidenceRequired: boolean; }

export function buildContinuityActions(gaps: Array<{ domain: string; severity: string; title: string; reason: string }>): ContinuityAction[] {
  return gaps.map((gap, index) => ({
    id: `continuity-${index + 1}`,
    domain: gap.domain,
    title: gap.title.replace(/ is unclear$/i, "").replace(/^\d+\s+memories need stronger provenance$/i, "Strengthen memory provenance"),
    reason: gap.reason,
    priority: gap.severity === "critical" ? "critical" : gap.severity === "important" ? "important" : "routine",
    status: "open",
    dependsOn: [],
    evidenceRequired: true,
  }));
}
