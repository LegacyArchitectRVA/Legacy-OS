export type ContinuityDomain = "personal" | "family" | "business" | "digital" | "financial" | "property" | "health" | "legal" | "wishes";

export interface ContinuityGap { domain: ContinuityDomain; severity: "critical" | "important" | "watch"; title: string; reason: string; }

export interface ContinuitySnapshot { totalMemories: number; domains: ContinuityDomain[]; gaps: ContinuityGap[]; readiness: number; }

const DOMAIN_KEYWORDS: Record<ContinuityDomain, string[]> = {
  personal: ["personal", "identity", "life"], family: ["family", "spouse", "child", "parent"], business: ["business", "company", "client", "vendor", "employee"], digital: ["email", "password", "account", "digital", "domain"], financial: ["bank", "investment", "insurance", "asset", "financial"], property: ["home", "house", "property", "vehicle", "utility"], health: ["medical", "doctor", "health", "medication"], legal: ["will", "trust", "estate", "attorney", "legal"], wishes: ["wish", "funeral", "burial", "cremation", "legacy"]
};

export function buildContinuitySnapshot(memories: Array<{ context: string; title: string; narrative: string; provenanceComplete?: boolean; evidenceClass?: string }>): ContinuitySnapshot {
  const text = memories.map((m) => `${m.context} ${m.title} ${m.narrative}`.toLowerCase()).join(" ");
  const domains = (Object.keys(DOMAIN_KEYWORDS) as ContinuityDomain[]).filter((domain) => DOMAIN_KEYWORDS[domain].some((keyword) => text.includes(keyword)));
  const gaps: ContinuityGap[] = [];
  if (!domains.includes("legal")) gaps.push({ domain: "legal", severity: "critical", title: "Legal continuity is unclear", reason: "No Recall information currently indicates where core legal or estate instructions live." });
  if (!domains.includes("digital")) gaps.push({ domain: "digital", severity: "critical", title: "Digital continuity is unclear", reason: "No Recall information currently identifies critical digital accounts or access instructions." });
  if (!domains.includes("financial")) gaps.push({ domain: "financial", severity: "important", title: "Financial continuity is unclear", reason: "No Recall information currently maps financial institutions or major assets." });
  if (!domains.includes("wishes")) gaps.push({ domain: "wishes", severity: "important", title: "Personal wishes are unclear", reason: "No Recall information currently captures end-of-life or legacy wishes." });
  const incomplete = memories.filter((m) => !m.provenanceComplete).length;
  if (incomplete > 0) gaps.push({ domain: "personal", severity: "watch", title: `${incomplete} memories need stronger provenance`, reason: "Some continuity information cannot yet be traced completely to its supporting evidence." });
  const coverage = domains.length / Object.keys(DOMAIN_KEYWORDS).length;
  const provenance = memories.length ? (memories.length - incomplete) / memories.length : 0;
  const readiness = Math.round(Math.max(0, Math.min(100, coverage * 70 + provenance * 30)));
  return { totalMemories: memories.length, domains, gaps, readiness };
}
