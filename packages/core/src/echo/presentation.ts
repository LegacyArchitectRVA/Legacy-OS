import { canAccessInformation, type EchoAuthorization } from "../memory/access.js";
import {
  evaluateExperiencePlanAuthorization,
  type EchoExperiencePlan,
  type ReconstructionAuthorization,
  type ReconstructionConsent,
} from "./reconstruction.js";
import type { Memory } from "../memory/model.js";

export type EchoPresentationMode = "reconstructed" | "documented" | "denied";

export interface EchoPresentationDecision {
  informationAllowed: boolean;
  reconstruction: ReconstructionAuthorization;
  mode: EchoPresentationMode;
}

/**
 * Information access and reconstruction access are independent decisions.
 * If the underlying memory is authorized but reconstruction is not, Echo
 * falls back to documented information instead of withholding the memory.
 */
export function decideEchoPresentation(
  memory: Memory,
  authorization: EchoAuthorization,
  plan: EchoExperiencePlan,
  reconstructionConsent: ReconstructionConsent,
  now = new Date(),
): EchoPresentationDecision {
  const informationAllowed = canAccessInformation(memory, authorization).allowed;
  const reconstruction = informationAllowed
    ? evaluateExperiencePlanAuthorization(plan, reconstructionConsent, now)
    : { allowed: false, reason: "subject-mismatch" as const };

  return {
    informationAllowed,
    reconstruction,
    mode: !informationAllowed
      ? "denied"
      : reconstruction.allowed
        ? "reconstructed"
        : "documented",
  };
}
