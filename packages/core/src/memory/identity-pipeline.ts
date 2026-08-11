import { matchIdentity, type IdentityMatch, type IdentityObservation } from "./identity.js";
import type { MemoryGraph } from "./model.js";

export interface ResolvedIdentity {
  observation: IdentityObservation;
  matches: IdentityMatch[];
  status: "matched" | "ambiguous" | "unresolved";
}

export function resolveIdentityObservation(
  graph: MemoryGraph,
  observation: IdentityObservation,
): ResolvedIdentity {
  const matches = matchIdentity(graph, observation);
  if (matches.length === 0) {
    return { observation, matches, status: "unresolved" };
  }
  if (matches.length > 1 && matches[0]!.score === matches[1]!.score) {
    return { observation, matches, status: "ambiguous" };
  }
  return { observation, matches, status: "matched" };
}
