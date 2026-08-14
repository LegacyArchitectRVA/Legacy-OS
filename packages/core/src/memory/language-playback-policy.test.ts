import { describe, expect, it } from "vitest";
import {
  createPlaybackPlan,
  detectLanguage,
  chooseResponseLanguage,
} from "./language-playback-policy.js";

describe("language and playback policy", () => {
  it("defaults to English", () => {
    expect(detectLanguage("Where did Dad eat?").language).toBe("en-US");
  });

  it("detects script-backed languages", () => {
    expect(detectLanguage("こんにちは").language).toBe("ja");
    expect(detectLanguage("안녕하세요").language).toBe("ko");
    expect(detectLanguage("مرحبا").language).toBe("ar");
  });

  it("lets an explicit requested language override detection", () => {
    expect(
      chooseResponseLanguage(
        { defaultLanguage: "en-US", requestedLanguage: "es" },
        { language: "ja", confidence: 0.98, source: "script" },
      ),
    ).toBe("es");
  });

  it("always preserves original media for playback", () => {
    const original = {
      sourceId: "voice-1",
      language: "es",
      mediaUri: "media://voice-1",
    };
    const plan = createPlaybackPlan(
      { defaultLanguage: "en-US" },
      { language: "en-US", confidence: 1, source: "default" },
      original,
    );

    expect(plan.responseLanguage).toBe("en-US");
    expect(plan.playOriginal).toBe(true);
    expect(plan.original).toEqual(original);
  });
});
