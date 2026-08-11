import type { EchoExperiencePlan, ReconstructionSegment } from "./reconstruction.js";

export interface SceneAsset {
  id: string;
  sourceId?: string;
  role: "avatar" | "voice" | "environment" | "original-media" | "caption";
  generated: boolean;
}

export interface EchoScene {
  memoryId: string;
  subjectPersonId: string;
  viewerPersonId: string;
  assets: SceneAsset[];
}

export function composeEchoScene(plan: EchoExperiencePlan): EchoScene {
  const assets: SceneAsset[] = [];

  for (const segment of plan.segments) {
    if (segment.kind === "scene") {
      assets.push({
        id: segment.id,
        role: "environment",
        generated: true,
      });
    }

    if (segment.kind === "avatar") {
      assets.push({ id: segment.id, role: "avatar", generated: true });
    }

    if (segment.kind === "voice") {
      assets.push({ id: segment.id, role: "voice", generated: true });
    }

    if (segment.kind === "memory-playback") {
      for (const sourceId of segment.sourceIds) {
        assets.push({
          id: `${segment.id}:${sourceId}`,
          sourceId,
          role: "original-media",
          generated: false,
        });
      }
    }
  }

  return {
    memoryId: plan.memoryId,
    subjectPersonId: plan.subjectPersonId,
    viewerPersonId: plan.viewerPersonId,
    assets,
  };
}
