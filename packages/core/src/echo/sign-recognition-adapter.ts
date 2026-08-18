import type { SignLanguage, SignRecognitionRequest, SignRecognitionResult } from "./sign-language";

export interface SignRecognitionAdapter {
  readonly id: string;
  readonly supportedLanguages: readonly SignLanguage[];
  recognize(request: SignRecognitionRequest): Promise<SignRecognitionResult>;
}

export const SIGN_RECOGNITION_CONFIDENCE_THRESHOLD = 0.8;

export function normalizeSignRecognitionResult(
  result: SignRecognitionResult,
  threshold = SIGN_RECOGNITION_CONFIDENCE_THRESHOLD,
): SignRecognitionResult {
  if (!result.recognized || result.confidence < threshold || !result.transcript?.trim()) {
    return {
      ...result,
      recognized: false,
      transcript: undefined,
      reason: result.reason === "information-denied" ? result.reason : "recognition-unavailable",
    };
  }
  return result;
}

export async function runSignRecognition(
  adapter: SignRecognitionAdapter,
  request: SignRecognitionRequest,
  threshold = SIGN_RECOGNITION_CONFIDENCE_THRESHOLD,
): Promise<SignRecognitionResult> {
  if (!request.informationAuthorized || !adapter.supportedLanguages.includes(request.language)) {
    return {
      language: request.language,
      recognized: false,
      confidence: 0,
      reason: request.informationAuthorized ? "recognition-unavailable" : "information-denied",
    };
  }
  return normalizeSignRecognitionResult(await adapter.recognize(request), threshold);
}

/** Explicit placeholder adapter until a production multimodal provider is configured. */
export const unavailableSignRecognitionAdapter: SignRecognitionAdapter = {
  id: "unavailable",
  supportedLanguages: ["ASL", "BSL", "ISL", "LSF"],
  async recognize(request) {
    return {
      language: request.language,
      recognized: false,
      confidence: 0,
      reason: request.informationAuthorized ? "recognition-unavailable" : "information-denied",
    };
  },
};
