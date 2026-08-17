export interface VoiceConsent {
  enabled: boolean;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
}

export interface VoiceSegment {
  id: string;
  subjectPersonId: string;
  transcript: string;
  sourceIds: readonly string[];
  generated: boolean;
  disclosure: "documented" | "reconstructed";
}

export interface VoiceProvider {
  readonly id: string;
  readonly version: string;
  synthesize(input: {
    subjectPersonId: string;
    transcript: string;
    voiceModelId: string;
  }): Promise<{ audioUri: string; durationMs: number }>;
}

function isActiveConsent(consent: VoiceConsent, now: Date): boolean {
  if (!consent.enabled || !consent.grantedBy || !consent.grantedAt) return false;
  const grantedAt = Date.parse(consent.grantedAt);
  if (!Number.isFinite(grantedAt) || grantedAt > now.getTime()) return false;
  if (!consent.expiresAt) return true;
  const expiresAt = Date.parse(consent.expiresAt);
  return Number.isFinite(expiresAt) && now.getTime() < expiresAt;
}

export function authorizeVoice(
  segment: VoiceSegment,
  consent: VoiceConsent,
  now = new Date(),
): VoiceSegment {
  if (!isActiveConsent(consent, now)) throw new Error("Voice reconstruction consent is not active");
  if (!segment.subjectPersonId) throw new Error("Voice reconstruction requires a subject person");
  if (!segment.transcript.trim()) throw new Error("Voice reconstruction requires a transcript");
  if (segment.sourceIds.length === 0) throw new Error("Voice reconstruction requires source evidence");
  if (!segment.generated || segment.disclosure !== "reconstructed") {
    throw new Error("Voice authorization is only valid for disclosed reconstructed voice segments");
  }
  return segment;
}
