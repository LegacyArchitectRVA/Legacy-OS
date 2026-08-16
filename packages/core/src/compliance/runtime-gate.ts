export type SensitiveDataClass =
  | "health"
  | "sud"
  | "financial"
  | "credentials"
  | "biometric"
  | "location"
  | "communications"
  | "minor"
  | "legal"
  | "business-confidential"
  | "sensitive-personal"
  | "public";

export interface ComplianceContext {
  dataClasses: SensitiveDataClass[];
  jurisdiction: string;
  authorized: boolean;
  consentActive: boolean;
  purpose: string;
  minimumNecessary: boolean;
  auditEnabled: boolean;
  retentionPolicyId?: string;
  vendorReviewComplete?: boolean;
  legalReviewComplete?: boolean;
}

export interface ComplianceDecision {
  allowed: boolean;
  reasons: string[];
  controls: string[];
}

const CONTROL_MAP: Record<SensitiveDataClass, string[]> = {
  health: ["HIPAA-applicability", "minimum-necessary", "access-control", "audit", "encryption", "retention"],
  sud: ["42-CFR-Part-2-applicability", "consent", "access-control", "audit", "encryption", "retention"],
  financial: ["financial-privacy-applicability", "access-control", "audit", "encryption", "retention"],
  credentials: ["secret-management", "strong-authentication", "access-control", "audit"],
  biometric: ["biometric-law-applicability", "explicit-consent", "access-control", "retention"],
  location: ["location-privacy", "purpose-limitation", "minimum-necessary", "retention"],
  communications: ["communications-consent", "access-control", "retention", "audit"],
  minor: ["minor-data", "age-assurance", "parental-consent-where-required", "retention"],
  legal: ["legal-document-protection", "access-control", "audit", "retention"],
  "business-confidential": ["confidentiality", "access-control", "audit", "retention"],
  "sensitive-personal": ["privacy-law-applicability", "purpose-limitation", "access-control", "retention"],
  public: [],
};

export function evaluateRuntimeCompliance(context: ComplianceContext): ComplianceDecision {
  const reasons: string[] = [];
  const controls = [...new Set(context.dataClasses.flatMap((kind) => CONTROL_MAP[kind]))];
  const sensitive = context.dataClasses.some((kind) => kind !== "public");

  if (!context.authorized && sensitive) reasons.push("authorization-required");
  if (!context.consentActive && sensitive) reasons.push("active-consent-required");
  if (!context.purpose.trim() && sensitive) reasons.push("purpose-required");
  if (!context.minimumNecessary && sensitive) reasons.push("minimum-necessary-failure");
  if (!context.auditEnabled && sensitive) reasons.push("audit-required");
  if (!context.retentionPolicyId && sensitive) reasons.push("retention-policy-required");
  if (sensitive && context.vendorReviewComplete === false) reasons.push("vendor-review-required");
  if (sensitive && context.legalReviewComplete === false) reasons.push("legal-review-required");
  if (!context.jurisdiction.trim()) reasons.push("jurisdiction-required");

  return { allowed: reasons.length === 0, reasons, controls };
}
