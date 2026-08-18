export type SignVoiceStatus = "ready" | "needs-transcript" | "needs-voice" | "unavailable";

export interface SignVideoVoicePlan {
  status: SignVoiceStatus;
  transcript?: string;
  voiceRequired: boolean;
  sourceLanguage: "ASL" | "BSL" | "ISL" | "LSF";
  note: string;
}

/**
 * Plans voice-over for a signed video. Voice is generated from a verified
 * sign-language transcript, never by guessing directly from pixels.
 */
export function planSignVideoVoice(input: {
  language: SignVideoVoicePlan["sourceLanguage"];
  transcript?: string;
  voiceAvailable: boolean;
}): SignVideoVoicePlan {
  if (!input.transcript?.trim()) {
    return {
      status: "needs-transcript",
      voiceRequired: true,
      sourceLanguage: input.language,
      note: "A verified sign-language transcript is required before voice can be generated.",
    };
  }

  if (!input.voiceAvailable) {
    return {
      status: "needs-voice",
      transcript: input.transcript,
      voiceRequired: true,
      sourceLanguage: input.language,
      note: "A compatible voice-generation provider is required to create the spoken track.",
    };
  }

  return {
    status: "ready",
    transcript: input.transcript,
    voiceRequired: true,
    sourceLanguage: input.language,
    note: "Generate a synchronized voice track from the verified transcript and preserve the original signed video.",
  };
}
