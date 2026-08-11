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

export function authorizeVoice(
  segment: VoiceSegment,
  consent: VoiceConsent,
): VoiceSegment {
  if (!consent.enabled) throw new Error("Voice reconstruction consent is not enabled");
  if (segment.sourceIds.length === 0) throw new Error("Voice reconstruction requires source evidence");
  return segment;
}
