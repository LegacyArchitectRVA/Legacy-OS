export type DataClass =
  | "public"
  | "personal"
  | "sensitive-personal"
  | "health"
  | "sud-part2"
  | "financial"
  | "credential"
  | "biometric"
  | "precise-location"
  | "communications"
  | "minor"
  | "legal-estate"
  | "business-confidential";

export interface ComplianceContext {
  jurisdiction: string;
  purpose: string;
  classifications: DataClass[];
  authorizationActive: boolean;
  consentActive: boolean;
  minimumNecessary: boolean;
}

export interface ComplianceDecision {
  allowed: boolean;
  reasons: string[];
  controls: string[];
}

const HIGH_RISK = new Set<DataClass>([
  "health",
  "sud-part2",
  "financial",
  "credential",
  "biometric",
  "precise-location",
  "communications",
  "minor",
]);

export function evaluateCompliance(context: ComplianceContext): ComplianceDecision {
  const reasons: string[] = [];
  const controls: string[] = ["least-privilege", "audit-trail", "data-minimization", "purpose-limitation"];

  if (!context.jurisdiction) reasons.push("jurisdiction-required");
  if (!context.purpose) reasons.push("purpose-required");
  if (!context.authorizationActive && context.classifications.some((c) => HIGH_RISK.has(c))) {
    reasons.push("authorization-required");
  }
  if (!context.consentActive && context.classifications.some((c) => HIGH_RISK.has(c))) {
    reasons.push("active-consent-required");
  }
  if (!context.minimumNecessary) reasons.push("minimum-necessary-failed");

  if (context.classifications.includes("health")) controls.push("hipaa-where-applicable");
  if (context.classifications.includes("sud-part2")) controls.push("42-cfr-part-2-where-applicable");
  if (context.classifications.includes("financial")) controls.push("financial-data-safeguards");
  if (context.classifications.includes("minor")) controls.push("minor-data-protections");
  if (context.classifications.includes("communications")) controls.push("communications-consent");
  if (context.classifications.includes("biometric")) controls.push("biometric-protection");
  if (context.classifications.includes("precise-location")) controls.push("location-protection");

  return { allowed: reasons.length === 0, reasons, controls };
}
