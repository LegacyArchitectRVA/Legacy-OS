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
  jurisdictions: string[];
  authorizationVerified: boolean;
  consentActive: boolean;
  auditEnabled: boolean;
  retentionPolicyVersion?: string;
  vendorReviewComplete: boolean;
  aiGovernanceReviewComplete: boolean;
  legalReviewRecorded: boolean;
}

export interface ComplianceDecision {
  allowed: boolean;
  blockers: string[];
}

export function evaluateReleaseGate(context: ComplianceContext): ComplianceDecision {
  const blockers: string[] = [];
  const sensitive = context.dataClasses.some((value) => value !== "public");

  if (sensitive && !context.authorizationVerified) blockers.push("authorization-not-verified");
  if (sensitive && !context.consentActive) blockers.push("consent-not-active");
  if (sensitive && !context.auditEnabled) blockers.push("audit-not-enabled");
  if (sensitive && !context.retentionPolicyVersion) blockers.push("retention-policy-missing");
  if (sensitive && !context.vendorReviewComplete) blockers.push("vendor-review-incomplete");
  if (!context.aiGovernanceReviewComplete) blockers.push("ai-governance-review-incomplete");
  if (!context.legalReviewRecorded) blockers.push("legal-review-not-recorded");
  if (!context.jurisdictions.length) blockers.push("jurisdiction-not-determined");

  return { allowed: blockers.length === 0, blockers };
}
