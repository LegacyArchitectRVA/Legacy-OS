import { describe, expect, it } from "vitest";
import { answerEchoQuestion, startEchoSession } from "./session.js";
import type { MemoryGraph } from "../memory/model.js";

const graph: MemoryGraph = {
  people: [
    { id: "dad", displayName: "Dad", relationshipLabels: ["father"] },
    { id: "child", displayName: "Child", relationshipLabels: ["daughter"] },
    { id: "stranger", displayName: "Stranger", relationshipLabels: [] },
  ],
  relationships: [{ id: "r1", fromPersonId: "child", toPersonId: "dad", label: "father", confidence: 1, sourceIds: ["family:1"] }],
  sources: [{ id: "photo:1", kind: "photo", title: "Fishing", importedAt: "2026-08-11T00:00:00Z" }],
  memories: [{ id: "memory:fishing", subjectPersonId: "dad", title: "Fishing", summary: "Dad took the family fishing at the lake.", participantIds: ["dad", "child"], evidence: [{ id: "e1", sourceId: "photo:1", kind: "photo", confidence: 0.98 }], knowledgeState: "known", confidence: 0.98, visibility: "family", tags: ["fishing", "lake"], createdAt: "2026-08-11T00:00:00Z", updatedAt: "2026-08-11T00:00:00Z" }],
};
const activeGrant = {
  id: "grant-1", subjectPersonId: "dad", scope: "memory" as const, status: "granted" as const,
  visibility: "family" as const, grantedAt: "2026-08-01T00:00:00Z", source: "subject" as const, policyVersion: "1",
};

describe("Echo session", () => {
  it("uses the canonical authorization path and permits authorized family memory", () => {
    const session = startEchoSession(graph, { viewerPersonId: "child", subjectPersonId: "dad", question: "fishing", grants: [activeGrant] }, "2026-08-11T00:00:00Z");
    const turn = answerEchoQuestion(graph, session, "Tell me about fishing");
    expect(session.authorized).toBe(true);
    expect(turn.grounded).toBe(true);
    expect(turn.memoryIds).toEqual(["memory:fishing"]);
  });

  it("blocks private memory even when the relationship is verified if consent is missing", () => {
    const privateGraph = { ...graph, memories: [{ ...graph.memories[0]!, visibility: "private" as const }] };
    const session = startEchoSession(privateGraph, { viewerPersonId: "child", subjectPersonId: "dad", question: "fishing" }, "2026-08-11T00:00:00Z");
    const turn = answerEchoQuestion(privateGraph, session, "Tell me about fishing");
    expect(session.authorized).toBe(false);
    expect(turn.grounded).toBe(false);
  });

  it("blocks an unrelated viewer", () => {
    const session = startEchoSession(graph, { viewerPersonId: "stranger", subjectPersonId: "dad", question: "fishing", grants: [activeGrant] }, "2026-08-11T00:00:00Z");
    const turn = answerEchoQuestion(graph, session, "Tell me about fishing");
    expect(session.authorized).toBe(false);
    expect(turn.memoryIds).toEqual([]);
  });
});
