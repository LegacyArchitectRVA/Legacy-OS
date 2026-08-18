import { describe, expect, it } from "vitest";
import {
  normalizeSignRecognitionResult,
  runSignRecognition,
  unavailableSignRecognitionAdapter,
} from "./sign-recognition-adapter";

describe("sign recognition adapter", () => {
  it("accepts a confident transcript", async () => {
    const adapter = {
      id: "test",
      supportedLanguages: ["ASL"] as const,
      recognize: async () => ({ language: "ASL" as const, recognized: true, transcript: "hello", confidence: 0.95, reason: "authorized" as const }),
    };
    await expect(runSignRecognition(adapter, { language: "ASL", mediaUri: "camera://1", informationAuthorized: true })).resolves.toMatchObject({ recognized: true, transcript: "hello" });
  });

  it("suppresses low-confidence transcripts", () => {
    expect(normalizeSignRecognitionResult({ language: "ASL", recognized: true, transcript: "maybe", confidence: 0.79, reason: "authorized" })).toMatchObject({ recognized: false, transcript: undefined });
  });

  it("blocks unauthorized recognition before calling the provider", async () => {
    let called = false;
    const adapter = { id: "test", supportedLanguages: ["ASL"] as const, recognize: async () => { called = true; return { language: "ASL" as const, recognized: true, transcript: "hello", confidence: 1, reason: "authorized" as const }; } };
    await expect(runSignRecognition(adapter, { language: "ASL", mediaUri: "camera://1", informationAuthorized: false })).resolves.toMatchObject({ recognized: false, reason: "information-denied" });
    expect(called).toBe(false);
  });

  it("rejects unsupported languages without invoking the provider", async () => {
    let called = false;
    const adapter = { id: "test", supportedLanguages: ["ASL"] as const, recognize: async () => { called = true; return { language: "ASL" as const, recognized: true, transcript: "hello", confidence: 1, reason: "authorized" as const }; } };
    await expect(runSignRecognition(adapter, { language: "BSL", mediaUri: "camera://1", informationAuthorized: true })).resolves.toMatchObject({ recognized: false, reason: "recognition-unavailable" });
    expect(called).toBe(false);
  });

  it("provides an explicit unavailable adapter", async () => {
    await expect(unavailableSignRecognitionAdapter.recognize({ language: "ASL", mediaUri: "camera://1", informationAuthorized: true })).resolves.toMatchObject({ recognized: false, confidence: 0, reason: "recognition-unavailable" });
  });
});
