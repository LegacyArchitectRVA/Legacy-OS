import { describe, expect, it } from "vitest";
import { createEnvironmentRequest, selectEnvironmentProvider } from "./environment-context.js";

describe("environment context", () => {
  it("validates location and historical observation time", () => {
    expect(createEnvironmentRequest(37.5, -77.4, "2026-08-12T18:30:00Z")).toEqual({
      latitude: 37.5,
      longitude: -77.4,
      observedAt: "2026-08-12T18:30:00Z",
    });
  });

  it("selects only a provider that explicitly supports the request", () => {
    const provider = {
      kind: "weather" as const,
      supports: () => true,
      lookup: async () => null,
    };
    expect(selectEnvironmentProvider([provider], createEnvironmentRequest(37, -77, "2020-01-01T12:00:00Z"))).toBe(provider);
  });
});
