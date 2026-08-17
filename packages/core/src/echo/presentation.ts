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
 *
 * The reconstruction plan is also bound to the authenticated viewer as a
 * defense-in-depth check, so a valid reconstruction plan cannot be replayed
 * for a different viewer.
 */
export function decideEchoPresentation(
  memory: Memory,
  authorization: EchoAuthorization,
  plan: EchoExperiencePlan,
  reconstructionConsent: ReconstructionConsent,
  now = new Date(),
): EchoPresentationDecision {
  const informationAllowed = canAccessInformation(memory, authorization);

  if (!informationAllowed.allowed) {
    return {
      informationAllowed: false,
      reconstruction: { allowed: false, reason: "subject-mismatch" },
      mode: "denied",
    };
  }

  if (plan.viewerPersonId !== authorization.viewerPersonId) {
    return {
      informationAllowed: true,
      reconstruction: { allowed: false, reason: "viewer-mismatch" },
      mode: "documented",
    };
  }

  const reconstruction = evaluateExperiencePlanAuthorization(plan, reconstructionConsent, now);

  return {
    informationAllowed: true,
    reconstruction,
    mode: reconstruction.allowed ? "reconstructed" : "documented",
  };
}
