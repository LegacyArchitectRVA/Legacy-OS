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

// Common family forms are aliases, not fuzzy identity matches. They are only
// expanded when the person's relationship label establishes the relationship.
const relationshipAliases: Record<string, string[]> = {
  father: ["dad", "daddy", "papa", "papi", "pop", "pops", "pa", "father"],
  mother: ["mom", "momma", "mama", "mommy", "mum", "mummy", "ma", "mother"],
  sister: ["sis", "sissy", "sister"],
  brother: ["bro", "brother"],
  grandmother: ["grandma", "grandmom", "grandmother", "granny", "nana", "nan", "meemaw", "mamaw", "mammaw", "gramma", "grammy", "gran"],
  grandfather: ["grandpa", "granddad", "grandfather", "grampy", "gramps", "papaw", "pawpaw", "grandpappy", "grandad"],
  daughter: ["daughter", "girl", "baby girl"],
  son: ["son", "boy", "baby boy"],
  wife: ["wife", "wifey", "missus", "mrs"],
  husband: ["husband", "hubby", "hubs", "mr"],
  aunt: ["aunt", "auntie", "aunty"],
  uncle: ["uncle", "unk", "unc"],
  cousin: ["cousin", "cuz", "cous"],
};

function canonicalRelationship(value: string): string {
  const normalized = normalize(value);
  for (const [canonical, aliases] of Object.entries(relationshipAliases)) {
    if (aliases.map(normalize).includes(normalized)) return canonical;
  }
  return normalized;
}

function personNames(person: MemoryPerson): string[] {
  const values = [person.displayName, ...person.relationshipLabels];
  return values.flatMap((value) => {
    const normalized = normalize(value);
    const canonical = canonicalRelationship(normalized);
    return [normalized, canonical, ...(relationshipAliases[canonical] ?? [])];
  }).map(normalize).filter(Boolean);
}

/** Conservative identity matching. Weak evidence never creates an identity match. */
export function matchIdentity(
  graph: MemoryGraph,
  observation: IdentityObservation,
): IdentityMatch[] {
  const value = normalize(observation.value);
  if (!value || observation.confidence < 0.8) return [];

  // The current MemoryPerson schema has no email, phone, or handle fields.
  // Never pretend those identifiers matched a person through a display name.
  if (observation.type === "email" || observation.type === "phone" || observation.type === "handle") {
    return [];
  }

  return graph.people
    .map((person) => {
      if (!personNames(person).some((name) => name === value)) return null;
      const relationshipAlias = person.relationshipLabels.some((label) => {
        const aliases = relationshipAliases[canonicalRelationship(label)] ?? [];
        return aliases.map(normalize).includes(value);
      });
      return {
        personId: person.id,
        score: Math.min(1, observation.confidence),
        reasons: relationshipAlias
          ? ["exact-normalized-name", "relationship-alias"]
          : ["exact-normalized-name"],
      };
    })
    .filter((match): match is IdentityMatch => match !== null)
    .sort((a, b) => b.score - a.score);
}
