import { describe, expect, it } from "vitest";
import { composeSignedVideoWithVoice } from "./media-composition";

describe("signed video composition", () => {
  const request = { videoUri: "video://signed", audioUri: "audio://voice", informationAuthorized: true };

  it("composes authorized media when an encoder is available", async () => {
    const adapter = { id: "test-encoder", compose: async () => ({ outputUri: "video://signed-with-voice" }) };
    await expect(composeSignedVideoWithVoice(request, adapter)).resolves.toEqual({
      status: "ready",
      sourceVideoUri: request.videoUri,
      audioUri: request.audioUri,
      outputUri: "video://signed-with-voice",
      preservesSource: true,
    });
  });

  it("does not compose unauthorized media", async () => {
    let called = false;
    const adapter = { id: "test-encoder", compose: async () => { called = true; return { outputUri: "video://should-not-exist" }; } };
    await expect(composeSignedVideoWithVoice({ ...request, informationAuthorized: false }, adapter)).resolves.toMatchObject({ status: "denied", preservesSource: true });
    expect(called).toBe(false);
  });

  it("reports unavailable when no encoder is configured", async () => {
    await expect(composeSignedVideoWithVoice(request)).resolves.toMatchObject({ status: "unavailable", preservesSource: true });
  });
});
