export interface LanguageProfile {
  language: string;
  locale: string;
  confidence: number;
}

export interface VoicePlaybackRequest {
  /** The original source text, never the translated response. */
  originalText: string;
  /** BCP-47 language/locale detected for the original recording/text. */
  originalLanguage: string;
  /** Optional language requested for the generated response. */
  responseLanguage?: string;
  /** Defaults to English when no response language is selected. */
  defaultResponseLanguage?: string;
}

export interface VoicePlaybackPlan {
  responseLanguage: string;
  originalPlaybackLanguage: string;
  playOriginal: boolean;
  originalText: string;
}

const ENGLISH = "en-US";

/**
 * Conservative language detection for routing. The production detector can
 * replace this implementation without changing the playback contract.
 */
export function detectLanguage(text: string): LanguageProfile {
  const normalized = text.trim();
  if (!normalized) return { language: "und", locale: "und", confidence: 0 };

  // High-signal script detection first. This intentionally does not claim
  // dialect certainty when the script cannot establish it.
  if (/\p{Script=Hiragana}|\p{Script=Katakana}/u.test(normalized)) {
    return { language: "ja", locale: "ja-JP", confidence: 0.98 };
  }
  if (/\p{Script=Hangul}/u.test(normalized)) {
    return { language: "ko", locale: "ko-KR", confidence: 0.98 };
  }
  if (/\p{Script=Arabic}/u.test(normalized)) {
    return { language: "ar", locale: "ar", confidence: 0.95 };
  }
  if (/\p{Script=Cyrillic}/u.test(normalized)) {
    return { language: "und-Cyrl", locale: "und-Cyrl", confidence: 0.75 };
  }
  if (/\p{Script=Han}/u.test(normalized)) {
    return { language: "zh", locale: "zh-CN", confidence: 0.9 };
  }

  // Do not pretend to distinguish Latin-script languages from a tiny sample.
  // The runtime language detector should supply a higher-confidence locale.
  return { language: "en", locale: ENGLISH, confidence: 0.5 };
}

/**
 * Responses default to English, while original source material is always
 * played using its original language. Translation must never silently replace
 * original-audio playback.
 */
export function createVoicePlaybackPlan(request: VoicePlaybackRequest): VoicePlaybackPlan {
  return {
    responseLanguage:
      request.responseLanguage ?? request.defaultResponseLanguage ?? ENGLISH,
    originalPlaybackLanguage: request.originalLanguage,
    playOriginal: true,
    originalText: request.originalText,
  };
}
