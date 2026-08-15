import { describe, expect, it } from "vitest";
import { answerEchoQuestion, startEchoSession } from "./session.js";
import type { MemoryGraph } from "../memory/model.js";

const graph: MemoryGraph = {
  people: [
    { id: "dad", displayName: "Dad", relationshipLabels: ["father"] },
    { id: "child", displayName: "Child", relationshipLabels: ["son"] },
    { id: "stranger", displayName: "Stranger", relationshipLabels: [] },
  ],
  relationships: [{ id: "r1", fromPersonId: "child", toPersonId: "dad", label: "father", confidence: 1, sourceIds: ["family:1"] }],
  sources: [{ id: "photo:1", kind: "photo", title: "Fishing", importedAt: "2026-08-11T00:00:00Z" }],
  memories: [{ id: "memory:fishing", subjectPersonId: "dad", title: "Fishing at the lake", summary: "Dad took the family fishing at the lake.", participantIds: ["dad", "child"], evidence: [{ id: "e1", sourceId: "photo:1", kind: "photo", confidence: 0.98 }], knowledgeState: "known", confidence: 0.98, visibility: "private", tags: ["fishing", "lake"], createdAt: "2026-08-11T00:00:00Z", updatedAt: "2026-08-11T00:00:00Z" }],
};

describe("Echo session", () => {
  it("does not expose private memory to a related viewer without an appropriate visibility grant", () => {
    const session = startEchoSession(graph, { viewerPersonId: "child", subjectPersonId: "dad", question: "fishing" }, "2026-08-11T00:00:00Z");
    const turn = answerEchoQuestion(graph, session, "Do you remember fishing at the lake?");
    expect(session.authorized).toBe(true);
    expect(turn.grounded).toBe(false);
    expect(turn.memoryIds).toEqual([]);
  });

  it("blocks an unrelated viewer", () => {
    const session = startEchoSession(graph, { viewerPersonId: "stranger", subjectPersonId: "dad", question: "fishing" }, "2026-08-11T00:00:00Z");
    const turn = answerEchoQuestion(graph, session, "Tell me about fishing");
    expect(session.authorized).toBe(false);
    expect(turn.grounded).toBe(false);
    expect(turn.memoryIds).toEqual([]);
  });
});
