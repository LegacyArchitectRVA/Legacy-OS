export interface ConsentGrant {
  granted: boolean;
  grantedAt: string;
  expiresAt?: string;
  revokedAt?: string;
}

/** A grant is usable only while granted, unrevoked, and unexpired. */
export function isConsentActive(grant: ConsentGrant, now: string | Date = new Date()): boolean {
  if (!grant.granted || grant.revokedAt) return false;
  if (!grant.expiresAt) return true;
  const nowMs = typeof now === "string" ? Date.parse(now) : now.getTime();
  const expiryMs = Date.parse(grant.expiresAt);
  return Number.isFinite(nowMs) && Number.isFinite(expiryMs) && nowMs < expiryMs;
}

export function requireActiveConsent(grant: ConsentGrant | undefined, operation: string, now?: string | Date): void {
  if (!grant || !isConsentActive(grant, now)) {
    throw new Error(`Active consent is required for ${operation}`);
  }
}
