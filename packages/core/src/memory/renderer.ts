import type { MemoryExperience, EchoAction } from "./experience.js";

export type EchoRendererTarget = "webgl" | "webgpu" | "xr" | "video";

export interface EchoRendererPlan {
  experienceId: string;
  target: EchoRendererTarget;
  avatar: {
    profileId?: string;
    voiceProfileId?: string;
    discloseAs: "ai-representation";
  };
  scene: {
    location?: string;
    mode: "documented" | "reconstructed";
    reconstructionNote?: string;
  };
  timeline: Array<{
    order: number;
    action: EchoAction["kind"];
    instruction: string;
    grounded: boolean;
  }>;
  media: MemoryExperience["mediaCues"];
  provenance: {
    evidenceIds: string[];
    knowledgeState: MemoryExperience["knowledgeState"];
    confidence: number;
  };
}

/** Converts a grounded experience into renderer-neutral instructions. */
export function buildRendererPlan(
  experience: MemoryExperience,
  target: EchoRendererTarget = "webgpu",
): EchoRendererPlan {
  return {
    experienceId: experience.id,
    target,
    avatar: {
      profileId: experience.avatar.avatarProfileId,
      voiceProfileId: experience.avatar.voiceProfileId,
      discloseAs: experience.avatar.identityDisclosure,
    },
    scene: {
      location: experience.scene.location,
      mode: experience.scene.environment,
      reconstructionNote: experience.scene.reconstructionNote,
    },
    timeline: experience.actions.map((action, order) => ({
      order,
      action: action.kind,
      instruction: action.instruction,
      grounded: action.grounded,
    })),
    media: experience.mediaCues,
    provenance: {
      evidenceIds: experience.evidenceIds,
      knowledgeState: experience.knowledgeState,
      confidence: experience.confidence,
    },
  };
}
