export type ContinuityDomain = "personal" | "family" | "business" | "digital" | "financial" | "property" | "health" | "legal" | "wishes";
export type ContinuityPillarKey = "digital_life" | "financial_assets" | "household_property" | "health_medical" | "vital_records" | "business_continuity" | "legacy_wishes";

export interface ContinuityGap { domain: ContinuityDomain; severity: "critical" | "important" | "watch"; title: string; reason: string; }
export interface ContinuitySnapshot { totalMemories: number; domains: ContinuityDomain[]; gaps: ContinuityGap[]; readiness: number; }
export interface ContinuityPillarCoverage { pillarKey: ContinuityPillarKey; coverageScore: number; status: "needs_attention" | "in_progress" | "ready"; matchedMemories: number; }

const DOMAIN_KEYWORDS: Record<ContinuityDomain, string[]> = {
  personal: ["personal", "identity", "life"],
  family: ["family", "spouse", "child", "parent"],
  business: ["business", "company", "client", "vendor", "employee"],
  digital: ["email", "password", "account", "digital", "domain", "device"],
  financial: ["bank", "investment", "insurance", "asset", "financial", "loan", "credit"],
  property: ["home", "house", "property", "vehicle", "utility", "maintenance"],
  health: ["medical", "doctor", "health", "medication", "care"],
  legal: ["will", "trust", "estate", "attorney", "legal", "power of attorney"],
  wishes: ["wish", "funeral", "burial", "cremation", "legacy", "message", "values"],
};

const PILLAR_KEYWORDS: Record<ContinuityPillarKey, string[]> = {
  digital_life: ["email", "password", "account", "digital", "domain", "device", "phone", "computer", "social"],
  financial_assets: ["bank", "investment", "insurance", "asset", "financial", "loan", "credit", "retirement", "mortgage"],
  household_property: ["home", "house", "property", "vehicle", "utility", "maintenance", "vendor", "appliance", "alarm"],
  health_medical: ["medical", "doctor", "health", "medication", "care", "hospital", "provider", "directive"],
  vital_records: ["birth", "marriage", "divorce", "death", "passport", "license", "identity", "military", "certificate", "record"],
  business_continuity: ["business", "company", "client", "vendor", "employee", "payroll", "operations", "succession", "customer"],
  legacy_wishes: ["wish", "funeral", "burial", "cremation", "legacy", "message", "values", "memorial", "gift"],
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

export function buildContinuityPillarCoverage(memories: Array<{ context: string; title: string; narrative: string; provenanceComplete?: boolean }>): ContinuityPillarCoverage[] {
  return (Object.keys(PILLAR_KEYWORDS) as ContinuityPillarKey[]).map((pillarKey) => {
    const matches = memories.filter((memory) => {
      const text = `${memory.context} ${memory.title} ${memory.narrative}`.toLowerCase();
      return PILLAR_KEYWORDS[pillarKey].some((keyword) => text.includes(keyword));
    });
    if (matches.length === 0) return { pillarKey, coverageScore: 0, status: "needs_attention", matchedMemories: 0 };

    const provenanceComplete = matches.filter((memory) => memory.provenanceComplete !== false).length;
    const score = Math.round(Math.min(100, 35 + Math.min(45, matches.length * 15) + (provenanceComplete / matches.length) * 20));
    const status = score >= 80 ? "ready" : score >= 40 ? "in_progress" : "needs_attention";
    return { pillarKey, coverageScore: score, status, matchedMemories: matches.length };
  });
}
