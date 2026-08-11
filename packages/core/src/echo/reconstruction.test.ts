import { describe, expect, it } from "vitest";
import { createExperiencePlan } from "./reconstruction.js";

describe("Echo reconstruction contract", () => {
  it("marks generated scene content as reconstructed rather than known", () => {
    const plan = createExperiencePlan("dad", "child", "memory:fishing", ["photo:1", "video:1"]);
    expect(plan.segments[0]).toMatchObject({
      kind: "scene",
      knowledgeState: "reconstructed",
      generated: true,
      consentScope: "reconstruction",
    });
    expect(plan.segments[0]?.sourceIds).toEqual(["photo:1", "video:1"]);
  });
});
