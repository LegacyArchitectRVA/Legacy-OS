import type { SignLanguage } from "./sign-language";
import type { SignRecognitionAdapter } from "./sign-recognition-adapter";
import { runSignRecognition } from "./sign-recognition-adapter";

export type SignVoiceStatus = "ready" | "needs-transcript" | "needs-voice" | "unavailable";

export interface SignVideoVoicePlan {
  status: SignVoiceStatus;
  transcript?: string;
  audioUri?: string;
  voiceRequired: boolean;
  sourceVideoUri: string;
  sourceLanguage: SignLanguage;
  note: string;
}

export interface VoiceGenerationAdapter {
  readonly id: string;
  synthesize(text: string, voiceId?: string): Promise<{ audioUri: string }>;
}

/** Plans and, when adapters are available, creates voice-over from verified signs. */
export async function createSignVideoVoice(
  input: {
    videoUri: string;
    language: SignLanguage;
    informationAuthorized: boolean;
    recognition?: SignRecognitionAdapter;
    voice?: VoiceGenerationAdapter;
    voiceId?: string;
  },
): Promise<SignVideoVoicePlan> {
  if (!input.informationAuthorized) {
    return {
      status: "unavailable",
      voiceRequired: true,
      sourceVideoUri: input.videoUri,
      sourceLanguage: input.language,
      note: "Authorization is required before the signed video can be processed.",
    };
  }

  if (!input.recognition) {
    return {
      status: "needs-transcript",
      voiceRequired: true,
      sourceVideoUri: input.videoUri,
      sourceLanguage: input.language,
      note: "A verified sign-language transcript is required before voice can be generated.",
    };
  }

  const recognized = await runSignRecognition(input.recognition, {
    language: input.language,
    mediaUri: input.videoUri,
    informationAuthorized: true,
  });

  if (!recognized.recognized || !recognized.transcript) {
    return {
      status: "needs-transcript",
      voiceRequired: true,
      sourceVideoUri: input.videoUri,
      sourceLanguage: input.language,
      note: "No sufficiently confident sign-language transcript is available yet.",
    };
  }

  if (!input.voice) {
    return {
      status: "needs-voice",
      transcript: recognized.transcript,
      voiceRequired: true,
      sourceVideoUri: input.videoUri,
      sourceLanguage: input.language,
      note: "A compatible voice-generation provider is required to create the spoken track.",
    };
  }

  try {
    const audio = await input.voice.synthesize(recognized.transcript, input.voiceId);
    return {
      status: "ready",
      transcript: recognized.transcript,
      audioUri: audio.audioUri,
      voiceRequired: true,
      sourceVideoUri: input.videoUri,
      sourceLanguage: input.language,
      note: "Voice track generated from the verified transcript; preserve the original signed video as the source.",
    };
  } catch {
    return {
      status: "unavailable",
      transcript: recognized.transcript,
      voiceRequired: true,
      sourceVideoUri: input.videoUri,
      sourceLanguage: input.language,
      note: "Voice generation is temporarily unavailable; the original signed video remains unchanged.",
    };
  }
}

export function planSignVideoVoice(input: {
  language: SignLanguage;
  transcript?: string;
  voiceAvailable: boolean;
  sourceVideoUri?: string;
}): SignVideoVoicePlan {
  if (!input.transcript?.trim()) {
    return {
      status: "needs-transcript",
      voiceRequired: true,
      sourceVideoUri: input.sourceVideoUri ?? "",
      sourceLanguage: input.language,
      note: "A verified sign-language transcript is required before voice can be generated.",
    };
  }

  if (!input.voiceAvailable) {
    return {
      status: "needs-voice",
      transcript: input.transcript,
      voiceRequired: true,
      sourceVideoUri: input.sourceVideoUri ?? "",
      sourceLanguage: input.language,
      note: "A compatible voice-generation provider is required to create the spoken track.",
    };
  }

  return {
    status: "ready",
    transcript: input.transcript,
    voiceRequired: true,
    sourceVideoUri: input.sourceVideoUri ?? "",
    sourceLanguage: input.language,
    note: "Generate a synchronized voice track from the verified transcript and preserve the original signed video.",
  };
}
