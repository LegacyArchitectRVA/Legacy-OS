import { describe, expect, it } from "vitest";
import { buildInvestigationTimeline } from "./investigation-timeline.js";

describe("investigation timeline", () => {
  it("preserves source provenance while grouping nearby evidence", () => {
    const timeline = buildInvestigationTimeline([
      { sourceId: "bank:1", capturedAt: "2025-06-14T18:00:00Z", place: "Chicago" },
      { sourceId: "receipt:1", capturedAt: "2025-06-15T19:00:00Z", place: "Chicago" },
      { sourceId: "photo:1", capturedAt: "2025-07-10T19:00:00Z", place: "Richmond" },
    ]);

    expect(timeline.events).toHaveLength(2);
    expect(timeline.events[0]?.sourceIds).toEqual(["bank:1", "receipt:1"]);
    expect(timeline.sourceIds).toEqual(["bank:1", "receipt:1", "photo:1"]);
  });
});
