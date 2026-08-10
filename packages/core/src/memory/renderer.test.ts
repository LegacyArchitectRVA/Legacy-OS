import { describe, expect, it } from "vitest";
import { buildRendererPlan } from "./renderer.js";
import type { MemoryExperience } from "./experience.js";

describe("Echo renderer plan", () => {
  it("preserves grounding and provenance while remaining renderer-neutral", () => {
    const experience: MemoryExperience = {
      id: "experience:memory:fishing:daughter",
      memoryId: "memory:fishing",
      subjectPersonId: "dad",
      viewerPersonId: "daughter",
      title: "Fishing at Smith Mountain Lake",
      narrative: "Dad remembered the fishing trip.",
      knowledgeState: "known",
      confidence: 0.97,
      avatar: { displayName: "Dad", identityDisclosure: "ai-representation" },
      scene: {
        location: "Smith Mountain Lake",
        environment: "reconstructed",
        reconstructionNote: "Unsupported environmental details are reconstruction.",
      },
      actions: [
        { kind: "speak", instruction: "Tell the grounded story.", grounded: true },
        { kind: "expression", instruction: "Use natural timing.", grounded: false },
        { kind: "show-media", instruction: "Show original evidence.", grounded: true },
      ],
      mediaCues: [
        {
          sourceId: "photo:2004",
          kind: "photo",
          title: "Fishing photo",
          timing: "during",
          spatial: { anchor: "left", emphasis: "primary" },
        },
      ],
      evidenceIds: ["evidence:photo"],
      disclosure: { knowledgeState: "known", confidence: 0.97, evidenceCount: 1 },
    };

    const plan = buildRendererPlan(experience);
    expect(plan.target).toBe("webgpu");
    expect(plan.avatar.discloseAs).toBe("ai-representation");
    expect(plan.provenance.evidenceIds).toEqual(["evidence:photo"]);
    expect(plan.timeline).toHaveLength(3);
    expect(plan.timeline[1]?.grounded).toBe(false);
    expect(plan.media[0]?.spatial.anchor).toBe("left");
  });
});
