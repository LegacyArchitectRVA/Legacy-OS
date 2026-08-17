import { describe, expect, it } from "vitest";
import { decideSignOutput, recognizeSignLanguage } from "./sign-language";

describe("sign language communication", () => {
  it("allows authorized signed output", () => {
    expect(decideSignOutput({ language: "ASL", text: "Hello", channel: "avatar", informationAuthorized: true })).toEqual({
      language: "ASL", channel: "avatar", text: "Hello", authorized: true, reason: "authorized",
    });
  });

  it("falls back to text when signed output is not authorized", () => {
    expect(decideSignOutput({ language: "ASL", text: "Hello", channel: "video", informationAuthorized: false })).toEqual({
      language: "ASL", channel: "text-fallback", text: "Hello", authorized: false, reason: "information-denied",
    });
  });

  it("never claims camera recognition when the recognizer is unavailable", () => {
    expect(recognizeSignLanguage({ language: "ASL", mediaUri: "camera://session", informationAuthorized: true })).toMatchObject({
      language: "ASL", recognized: false, confidence: 0, reason: "recognition-unavailable",
    });
  });

  it("does not process unauthorized camera input", () => {
    expect(recognizeSignLanguage({ language: "ASL", mediaUri: "camera://session", informationAuthorized: false })).toMatchObject({
      recognized: false, confidence: 0, reason: "information-denied",
    });
  });
});
