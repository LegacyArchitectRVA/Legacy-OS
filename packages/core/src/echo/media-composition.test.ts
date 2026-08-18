import { describe, expect, it } from "vitest";
import { composeSignedVideoWithVoice } from "./media-composition";

describe("signed video composition", () => {
  const request = { sourceVideoUri: "video://signed", voiceAudioUri: "audio://voice", informationAuthorized: true };

  it("composes authorized media when an encoder is available", async () => {
    const adapter = { id: "test-encoder", compose: async () => ({ outputVideoUri: "video://signed-with-voice" }) };
    await expect(composeSignedVideoWithVoice(request, adapter)).resolves.toEqual({
      status: "ready",
      sourceVideoUri: request.sourceVideoUri,
      voiceAudioUri: request.voiceAudioUri,
      outputVideoUri: "video://signed-with-voice",
      encoderId: "test-encoder",
      note: "Voiced copy created; the original signed video remains the source of truth.",
    });
  });

  it("does not compose unauthorized media", async () => {
    let called = false;
    const adapter = { id: "test-encoder", compose: async () => { called = true; return { outputVideoUri: "video://should-not-exist" }; } };
    await expect(composeSignedVideoWithVoice({ ...request, informationAuthorized: false }, adapter)).resolves.toMatchObject({ status: "denied" });
    expect(called).toBe(false);
  });

  it("reports the missing encoder explicitly", async () => {
    await expect(composeSignedVideoWithVoice(request)).resolves.toMatchObject({ status: "needs-encoder", sourceVideoUri: request.sourceVideoUri, voiceAudioUri: request.voiceAudioUri });
  });
});
