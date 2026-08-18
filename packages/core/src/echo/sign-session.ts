import type { SignLanguage } from "./sign-language";
import { runSignRecognition, type SignRecognitionAdapter } from "./sign-recognition-adapter";
import type { SignRecognitionRequest } from "./sign-language";

export interface SignSessionResult {
  language: SignLanguage;
  status: "ready" | "recognized" | "uncertain" | "denied";
  transcript?: string;
  confidence: number;
}

/** Single-session orchestration boundary for an authorized camera stream. */
export async function processSignFrame(
  adapter: SignRecognitionAdapter,
  request: SignRecognitionRequest,
): Promise<SignSessionResult> {
  const result = await runSignRecognition(adapter, request);

  if (result.reason === "information-denied") {
    return { language: request.language, status: "denied", confidence: 0 };
  }
  if (!result.recognized) {
    return { language: request.language, status: "uncertain", confidence: result.confidence };
  }
  return {
    language: request.language,
    status: "recognized",
    transcript: result.transcript,
    confidence: result.confidence,
  };
}
