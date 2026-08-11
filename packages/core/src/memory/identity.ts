import type { MemoryGraph, MemoryPerson } from "./model.js";

export interface IdentityObservation {
  value: string;
  sourceId: string;
  confidence: number;
  type: "name" | "email" | "phone" | "handle" | "relationship-label";
}

export interface IdentityMatch {
  personId: string;
  score: number;
  reasons: string[];
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9@+]+/g, " ").replace(/\s+/g, " ");
}

function personNames(person: MemoryPerson): string[] {
  return [person.displayName, ...person.relationshipLabels].map(normalize).filter(Boolean);
}

/** Conservative identity matching. Weak evidence never creates an identity match. */
export function matchIdentity(
  graph: MemoryGraph,
  observation: IdentityObservation,
): IdentityMatch[] {
  const value = normalize(observation.value);
  if (!value || observation.confidence < 0.8) return [];

  return graph.people
    .map((person) => {
      if (!personNames(person).some((name) => name === value)) return null;
      return {
        personId: person.id,
        score: Math.min(1, observation.confidence),
        reasons: ["exact-normalized-name"],
      };
    })
    .filter((match): match is IdentityMatch => match !== null)
    .sort((a, b) => b.score - a.score);
}
