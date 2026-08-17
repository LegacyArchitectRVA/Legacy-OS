import { describe, expect, it } from "vitest";
import { authorizeEchoAccess } from "../memory/access.js";
import type { Memory, MemoryGraph, MemoryQueryContext } from "../memory/model.js";
import { createExperiencePlan } from "./reconstruction.js";
import { decideEchoPresentation } from "./presentation.js";

const memory: Memory = {
  id: "memory:fishing",
  subjectPersonId: "dad",
  title: "Fishing",
  summary: "A documented fishing trip.",
  participantIds: ["dad", "daughter"],
  evidence: [],
  knowledgeState: "known",
  confidence: 0.97,
  visibility: "family",
  tags: ["fishing"],
  createdAt: "2026-08-09T00:00:00Z",
  updatedAt: "2026-08-09T00:00:00Z",
};

const graph: MemoryGraph = {
  people: [],
  sources: [],
  memories: [memory],
  relationships: [{
    id: "rel:dad:daughter",
    fromPersonId: "daughter",
    toPersonId: "dad",
    label: "father",
    confidence: 0.98,
    sourceIds: ["family-record"],
  }],
};

const context: MemoryQueryContext = {
  viewerPersonId: "daughter",
  subjectPersonId: "dad",
  query: "Tell me about fishing",
};

const memoryGrant = {
  id: "memory-consent",
  subjectPersonId: "dad",
  scope: "memory" as const,
  status: "granted" as const,
  visibility: "family" as const,
  grantedAt: "2026-08-01T00:00:00Z",
  source: "subject" as const,
  policyVersion: "1",
};

const reconstructionPlan = createExperiencePlan("dad", "daughter", memory.id, ["photo:fishing"]);
const reconstructionConsent = {
  enabled: true,
  scope: ["scene"] as const,
  grantedBy: "dad",
  grantedAt: "2026-08-01T00:00:00Z",
};

describe("Echo presentation", () => {
  it("falls back to documented information when reconstruction is unauthorized", () => {
    const authorization = authorizeEchoAccess(graph, context, "family", [memoryGrant], new Date("2026-08-09T00:00:00Z"));
    const decision = decideEchoPresentation(
      memory,
      authorization,
      reconstructionPlan,
      { ...reconstructionConsent, enabled: false },
      new Date("2026-08-09T00:00:00Z"),
    );

    expect(decision.informationAllowed).toBe(true);
    expect(decision.reconstruction.allowed).toBe(false);
    expect(decision.mode).toBe("documented");
  });

  it("uses reconstruction when both layers are authorized", () => {
    const authorization = authorizeEchoAccess(graph, context, "family", [memoryGrant], new Date("2026-08-09T00:00:00Z"));
    const decision = decideEchoPresentation(
      memory,
      authorization,
      reconstructionPlan,
      reconstructionConsent,
      new Date("2026-08-09T00:00:00Z"),
    );

    expect(decision.informationAllowed).toBe(true);
    expect(decision.reconstruction.allowed).toBe(true);
    expect(decision.mode).toBe("reconstructed");
  });

  it("falls back to documented information when a reconstruction plan belongs to another viewer", () => {
    const authorization = authorizeEchoAccess(graph, context, "family", [memoryGrant], new Date("2026-08-09T00:00:00Z"));
    const otherViewerPlan = createExperiencePlan("dad", "momma", memory.id, ["photo:fishing"]);
    const decision = decideEchoPresentation(
      memory,
      authorization,
      otherViewerPlan,
      reconstructionConsent,
      new Date("2026-08-09T00:00:00Z"),
    );

    expect(decision.informationAllowed).toBe(true);
    expect(decision.reconstruction.allowed).toBe(false);
    expect(decision.mode).toBe("documented");
  });

  it("denies the presentation when the underlying information is unauthorized", () => {
    const authorization = authorizeEchoAccess(graph, context, "family", []);
    const decision = decideEchoPresentation(
      memory,
      authorization,
      reconstructionPlan,
      reconstructionConsent,
      new Date("2026-08-09T00:00:00Z"),
    );

    expect(decision.informationAllowed).toBe(false);
    expect(decision.mode).toBe("denied");
  });
});
