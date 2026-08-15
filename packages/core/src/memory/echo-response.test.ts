import { describe, expect, it } from "vitest";
import { buildEchoResponse } from "./echo-response.js";

describe("Echo response contract", () => {
  it("defaults the response to English while preserving original evidence language", () => {
    const response = buildEchoResponse({
      answer: "He ate at the restaurant.",
      language: { inputLanguage: "es" },
      visibility: "successor",
      evidenceLanguages: [
        {
          evidenceId: "audio-1",
          language: "es",
          originalMedia: {
            sourceId: "audio-source",
            mediaId: "audio-1",
            language: "es",
            mimeType: "audio/mpeg",
          },
        },
      ],
    });

    expect(response.responseLanguage).toBe("es");
    expect(response.evidenceLanguages[0].language).toBe("es");
    expect(response.originalMedia[0].language).toBe("es");
    expect(response.playback.playOriginal).toBe(true);
  });

  it("uses an explicit response-language preference without changing evidence provenance", () => {
    const response = buildEchoResponse({
      answer: "He ate at the restaurant.",
      language: { inputLanguage: "es", requestedLanguage: "en-US" },
      visibility: "successor",
      evidenceLanguages: [{ evidenceId: "r1", language: "es" }],
    });

    expect(response.responseLanguage).toBe("en-US");
    expect(response.evidenceLanguages[0].language).toBe("es");
    expect(response.originalMedia).toEqual([]);
    expect(response.playback.playOriginal).toBe(false);
  });
});
