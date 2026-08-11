import { describe, expect, it } from "vitest";
import { composeEchoScene } from "./scene-composer.js";
import { createExperiencePlan } from "./reconstruction.js";

describe("Echo scene composer", () => {
  it("keeps original memory media distinct from generated scene content", () => {
    const plan = createExperiencePlan("dad", "child", "memory:fishing", ["photo:1", "video:1"]);
    plan.segments.push({
      id: "memory:fishing:playback",
      kind: "memory-playback",
      subjectPersonId: "dad",
      knowledgeState: "known",
      confidence: 1,
      sourceIds: ["photo:1", "video:1"],
      consentScope: "reconstruction",
      generated: false,
    });

    const scene = composeEchoScene(plan);
    const originals = scene.assets.filter((asset) => asset.role === "original-media");
    const environment = scene.assets.find((asset) => asset.role === "environment");

    expect(originals).toHaveLength(2);
    expect(originals.every((asset) => asset.generated === false)).toBe(true);
    expect(environment?.generated).toBe(true);
  });
});
