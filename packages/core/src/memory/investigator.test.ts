import { describe, expect, it } from "vitest";
import { investigate } from "./investigator.js";
import type { Memory } from "./model.js";

const memory: Memory = {
  id: "m1",
  subjectPersonId: "person-1",
  title: "Chicago dinner",
  summary: "He ate at Example Grill in Chicago.",
  occurredAt: "2026-06-14T19:00:00Z",
  location: "Chicago, IL",
  participantIds: ["person-1"],
  evidence: [
    {
      id: "e1",
      sourceId: "receipt-1",
      kind: "receipt",
      excerpt: "Example Grill $48.32",
      capturedAt: "2026-06-14T19:30:00Z",
      confidence: 0.95,
      original: true,
    },
  ],
  knowledgeState: "known",
  confidence: 0.95,
  visibility: "successor",
  tags: ["Chicago", "dinner"],
  createdAt: "2026-06-14T20:00:00Z",
  updatedAt: "2026-06-14T20:00:00Z",
};

describe("investigator", () => {
  it("returns factual findings with supporting evidence", () => {
    const result = investigate([memory], "Chicago dinner");
    expect(result.findings[0].evidenceIds).toEqual(["e1"]);
    expect(result.answer).toContain("Example Grill");
    expect(result.disclosure.evidenceCount).toBe(1);
  });

  it("reports an evidence gap instead of inventing an answer", () => {
    const result = investigate([memory], "what he ordered");
    expect(result.answer).toBe("I couldn't find enough evidence to answer that.");
    expect(result.gaps.length).toBe(1);
  });
});
