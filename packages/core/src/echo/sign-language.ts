export type SignLanguage = "ASL" | "BSL" | "ISL" | "LSF";
export type SignChannel = "camera" | "avatar" | "video";

export interface SignLanguageProfile {
  language: SignLanguage;
  preferredChannel: SignChannel;
  region?: string;
  speed?: number;
}

export interface SignRecognitionRequest {
  language: SignLanguage;
  mediaUri: string;
  informationAuthorized: boolean;
}

export interface SignRecognitionResult {
  language: SignLanguage;
  recognized: boolean;
  transcript?: string;
  confidence: number;
  reason: "authorized" | "information-denied" | "recognition-unavailable";
}

export interface SignOutputRequest {
  language: SignLanguage;
  text: string;
  channel: "avatar" | "video";
  informationAuthorized: boolean;
}

export interface SignOutputDecision {
  language: SignLanguage;
  channel: "avatar" | "video" | "text-fallback";
  text: string;
  authorized: boolean;
  reason: "authorized" | "information-denied";
}

/**
 * Sign-language communication is modeled as a language channel, not merely
 * a visual effect. Recognition and signing output remain independently
 * authorized so camera/video data is never implicitly exposed.
 */
export function decideSignOutput(request: SignOutputRequest): SignOutputDecision {
  if (!request.informationAuthorized) {
    return {
      language: request.language,
      channel: "text-fallback",
      text: request.text,
      authorized: false,
      reason: "information-denied",
    };
  }

  return {
    language: request.language,
    channel: request.channel,
    text: request.text,
    authorized: true,
    reason: "authorized",
  };
}

export function recognizeSignLanguage(request: SignRecognitionRequest): SignRecognitionResult {
  if (!request.informationAuthorized) {
    return {
      language: request.language,
      recognized: false,
      confidence: 0,
      reason: "information-denied",
    };
  }

  // The production recognizer will be supplied by the multimodal inference layer.
  return {
    language: request.language,
    recognized: false,
    confidence: 0,
    reason: "recognition-unavailable",
  };
}

export const supportedSignLanguages: SignLanguage[] = ["ASL", "BSL", "ISL", "LSF"];
