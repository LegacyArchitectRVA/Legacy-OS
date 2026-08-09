import { describe, expect, it } from "vitest";
import { buildMemoryExperience } from "./experience.js";
import type { MemoryResponse } from "./model.js";

describe("memory experience", () => {
  it("turns a grounded memory into an evidence-aware experience", () => {
    const response: MemoryResponse = {
      answer: "As daughter, Dad remembered the fishing trip.",
      matches: [
        {
          score: 0.96,
          relationshipRelevance: 1,
          memory: {
            id: "memory:fishing",
            subjectPersonId: "dad",
            title: "Fishing at Smith Mountain Lake",
            summary: "Dad remembered the fishing trip.",
            location: "Smith Mountain Lake",
            participantIds: ["dad", "daughter"],
            evidence: [
              { id: "evidence:photo", sourceId: "photo:2004", kind: "photo", confidence: 0.99 },
              { id: "evidence:video", sourceId: "video:2004", kind: "video", confidence: 0.98 },
            ],
            knowledgeState: "known",
            confidence: 0.97,
            visibility: "family",
            tags: ["fishing", "family"],
            createdAt: "2026-08-09T00:00:00Z",
            updatedAt: "2026-08-09T00:00:00Z",
          },
          matchedEvidence: [],
        },
      ],
      disclosure: { knowledgeState: "known", confidence: 0.97, evidenceCount: 2 },
    };

    response.matches[0].matchedEvidence = response.matches[0].memory.evidence;
    const experience = buildMemoryExperience(response, "daughter");

    expect(experience).not.toBeNull();
    expect(experience?.memoryId).toBe("memory:fishing");
    expect(experience?.avatar.identityDisclosure).toBe("ai-representation");
    expect(experience?.scene.environment).toBe("reconstructed");
    expect(experience?.evidenceIds).toEqual(["evidence:photo", "evidence:video"]);
    expect(experience?.mediaCues[0]?.spatial.anchor).toBe("left");
    expect(experience?.actions.some((action) => action.kind === "scene")).toBe(true);
    expect(experience?.actions.some((action) => action.kind === "show-media")).toBe(true);
  });

  it("does not create an experience without a grounded memory match", () => {
    const response: MemoryResponse = {
      answer: "There is not enough evidence to answer that memory accurately.",
      matches: [],
      disclosure: { knowledgeState: "unknown", confidence: 0, evidenceCount: 0 },
    };

    expect(buildMemoryExperience(response, "daughter")).toBeNull();
  });
});
