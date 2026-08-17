import { describe, expect, it } from "vitest";
import { authorizeVoice } from "./voice.js";

describe("voice reconstruction", () => {
  const segment = {
    id: "voice:fishing",
    subjectPersonId: "dad",
    transcript: "Remember that fishing trip?",
    sourceIds: ["audio:fishing"],
    generated: true,
    disclosure: "reconstructed" as const,
  };

  it("requires active voice consent", () => {
    expect(() => authorizeVoice(segment, {
      enabled: false,
      grantedBy: "child",
      grantedAt: "2026-08-11T00:00:00Z",
    })).toThrow("Voice reconstruction consent is not active");
  });

  it("requires evidence", () => {
    expect(() => authorizeVoice({ ...segment, sourceIds: [] }, {
      enabled: true,
      grantedBy: "child",
      grantedAt: "2026-08-11T00:00:00Z",
    })).toThrow("requires source evidence");
  });

  it("rejects expired voice consent", () => {
    expect(() => authorizeVoice(segment, {
      enabled: true,
      grantedBy: "child",
      grantedAt: "2026-08-11T00:00:00Z",
      expiresAt: "2026-08-12T00:00:00Z",
    }, new Date("2026-08-12T00:00:01Z"))).toThrow("consent is not active");
  });
});
