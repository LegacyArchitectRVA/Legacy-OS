import { describe, expect, it } from "vitest";
import { buildPlaybackPlan, chooseResponseLanguage } from "./language-playback.js";

describe("language and playback policy", () => {
  it("defaults to English", () => {
    expect(chooseResponseLanguage({})).toBe("en-US");
  });

  it("uses the requested language over detected input language", () => {
    expect(
      chooseResponseLanguage({ inputLanguage: "es", requestedLanguage: "fr" }),
    ).toBe("fr");
  });

  it("preserves original media independently from translated speech", () => {
    const plan = buildPlaybackPlan({
      inputLanguage: "es",
      requestedLanguage: "en-US",
      visibility: "successor",
      originalMedia: {
        sourceId: "audio-source",
        mediaId: "audio-1",
        language: "es",
        mimeType: "audio/mpeg",
      },
    });

    expect(plan.responseLanguage).toBe("en-US");
    expect(plan.generatedSpeechLanguage).toBe("en-US");
    expect(plan.playOriginal).toBe(true);
    expect(plan.originalMedia?.language).toBe("es");
  });
});
