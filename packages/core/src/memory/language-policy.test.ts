import { describe, expect, it } from "vitest";
import { createVoicePlaybackPlan, detectLanguage } from "./language-policy.js";

describe("language policy", () => {
  it("detects high-signal scripts", () => {
    expect(detectLanguage("こんにちは").locale).toBe("ja-JP");
    expect(detectLanguage("안녕하세요").locale).toBe("ko-KR");
    expect(detectLanguage("你好").language).toBe("zh");
  });

  it("defaults generated responses to English", () => {
    const plan = createVoicePlaybackPlan({
      originalText: "Bonjour, papa.",
      originalLanguage: "fr-FR",
    });
    expect(plan.responseLanguage).toBe("en-US");
  });

  it("always preserves original-language playback", () => {
    const plan = createVoicePlaybackPlan({
      originalText: "Bonjour, papa.",
      originalLanguage: "fr-FR",
      responseLanguage: "es-ES",
    });
    expect(plan.playOriginal).toBe(true);
    expect(plan.originalPlaybackLanguage).toBe("fr-FR");
    expect(plan.originalText).toBe("Bonjour, papa.");
  });
});
