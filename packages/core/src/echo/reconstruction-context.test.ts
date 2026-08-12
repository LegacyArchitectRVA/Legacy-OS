import { describe, expect, it } from "vitest";
import { buildReconstructionContext, verifiedContextStatements } from "./reconstruction-context.js";

describe("reconstruction context", () => {
  it("sorts evidence and preserves original media provenance", () => {
    const context = buildReconstructionContext({
      memoryId: "memory:fishing",
      subjectPersonId: "dad",
      viewerPersonId: "child",
      time: {
        startAt: "2018-06-15T16:30:00Z",
        confidence: 0.95,
        sourceIds: ["video:1"],
      },
      location: {
        label: "Smith Mountain Lake",
        latitude: 37.1,
        longitude: -79.6,
        confidence: 0.9,
        sourceIds: ["photo:1"],
      },
      environment: {
        weather: { temperatureF: 78, cloudCover: "partly cloudy" },
        sourceIds: ["weather:1"],
        confidence: 0.82,
      },
      originalMedia: ["video:1", "photo:1", "video:1"],
      evidence: [
        { sourceId: "weather:1", kind: "historical-weather", confidence: 0.82, statement: "Historical weather was approximately 78°F." },
        { sourceId: "video:1", kind: "video", confidence: 0.98, statement: "The video shows Dad fishing." },
      ],
    });

    expect(context.originalMedia).toEqual(["video:1", "photo:1"]);
    expect(context.evidence[0]?.sourceId).toBe("video:1");
    expect(verifiedContextStatements(context)).toEqual(["The video shows Dad fishing."]);
  });
});
