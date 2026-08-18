import { describe, expect, it } from "vitest";
import { createSignVideoVoice, planSignVideoVoice } from "./sign-video-voice";

describe("sign video voice pipeline", () => {
  const recognition = {
    id: "test-recognition",
    supportedLanguages: ["ASL"] as const,
    recognize: async () => ({
      language: "ASL" as const,
      recognized: true,
      transcript: "Welcome home",
      confidence: 0.96,
      reason: "authorized" as const,
    }),
  };

  const voice = {
    id: "test-voice",
    synthesize: async () => ({ audioUri: "audio://welcome-home" }),
  };

  it("returns a playable voice asset from a verified transcript", async () => {
    await expect(createSignVideoVoice({
      videoUri: "video://signed-message",
      language: "ASL",
      informationAuthorized: true,
      recognition,
      voice,
    })).resolves.toMatchObject({ status: "ready", transcript: "Welcome home", audioUri: "audio://welcome-home" });
  });

  it("requires a transcript before voice generation", () => {
    expect(planSignVideoVoice({ language: "ASL", voiceAvailable: true })).toMatchObject({ status: "needs-transcript" });
  });

  it("keeps the original video reference when voice generation is unavailable", async () => {
    const failingVoice = { id: "failing", synthesize: async () => { throw new Error("provider unavailable"); } };
    await expect(createSignVideoVoice({ videoUri: "video://original", language: "ASL", informationAuthorized: true, recognition, voice: failingVoice })).resolves.toMatchObject({ status: "unavailable", sourceVideoUri: "video://original", transcript: "Welcome home" });
  });
});
