import type { MemoryGraph, MemoryPerson, MemoryRelationship } from "./model.js";

export type RelationshipKind =
  | "mother" | "father" | "parent"
  | "daughter" | "son" | "child"
  | "sister" | "brother" | "sibling"
  | "grandmother" | "grandfather" | "grandparent"
  | "granddaughter" | "grandson" | "grandchild"
  | "aunt" | "uncle" | "niece" | "nephew"
  | "cousin" | "wife" | "husband" | "spouse"
  | "partner" | "girlfriend" | "boyfriend"
  | "stepmother" | "stepfather" | "stepparent"
  | "stepdaughter" | "stepson" | "stepchild"
  | "stepsister" | "stepbrother" | "stepsibling"
  | "mother-in-law" | "father-in-law" | "parent-in-law"
  | "daughter-in-law" | "son-in-law" | "child-in-law"
  | "sister-in-law" | "brother-in-law" | "sibling-in-law"
  | "friend" | "roommate" | "colleague" | "caregiver";

const aliases: Record<RelationshipKind, string[]> = {
  mother: ["mom", "momma", "mama", "ma", "mum", "mummy", "mommy", "mother"],
  father: ["dad", "daddy", "papa", "papi", "pa", "pop", "pops", "father"],
  parent: ["parent", "my parent"],
  daughter: ["daughter", "my daughter", "girl", "baby girl"],
  son: ["son", "my son", "boy", "baby boy"],
  child: ["child", "my child", "kid", "kiddo"],
  sister: ["sis", "sissy", "sister"],
  brother: ["bro", "brother", "brother"],
  sibling: ["sibling", "sib", "sis", "bro"],
  grandmother: ["grandma", "gramma", "grammy", "granny", "nan", "nana", "nanny", "meemaw", "memaw", "mamaw", "grandmother"],
  grandfather: ["grandpa", "gramps", "granddad", "grandad", "papa", "pappy", "papaw", "peepaw", "grandfather"],
  grandparent: ["grandparent", "grandma", "grandpa", "granny", "gramps", "meemaw", "papaw"],
  granddaughter: ["granddaughter", "grandbaby girl", "grandgirl"],
  grandson: ["grandson", "grandbaby boy", "grandboy"],
  grandchild: ["grandchild", "grandkid", "grandbaby"],
  aunt: ["aunt", "auntie", "aunty"],
  uncle: ["uncle", "unk", "unc"],
  niece: ["niece"],
  nephew: ["nephew"],
  cousin: ["cousin", "cuz", "cuzzie"],
  wife: ["wife", "wifey", "missus", "mrs"],
  husband: ["husband", "hubby", "hub", "mr"],
  spouse: ["spouse", "partner"],
  partner: ["partner", "significant other", "SO"],
  girlfriend: ["girlfriend", "gf"],
  boyfriend: ["boyfriend", "bf"],
  stepmother: ["stepmom", "stepmomma", "stepmother"],
  stepfather: ["stepdad", "stepdaddy", "stepfather"],
  stepparent: ["stepparent", "step-parent"],
  stepdaughter: ["stepdaughter", "step-daughter"],
  stepson: ["stepson", "step-son"],
  stepchild: ["stepchild", "stepkid", "step-child"],
  stepsister: ["stepsis", "stepsister"],
  stepbrother: ["stepbro", "stepbrother"],
  stepsibling: ["stepsibling", "step-sibling"],
  "mother-in-law": ["MIL", "mother-in-law", "mom-in-law"],
  "father-in-law": ["FIL", "father-in-law", "dad-in-law"],
  "parent-in-law": ["in-law", "parent-in-law"],
  "daughter-in-law": ["DIL", "daughter-in-law"],
  "son-in-law": ["SIL", "son-in-law"],
  "child-in-law": ["child-in-law"],
  "sister-in-law": ["SIL", "sister-in-law"],
  "brother-in-law": ["BIL", "brother-in-law"],
  "sibling-in-law": ["in-law", "sibling-in-law"],
  friend: ["friend", "bestie", "best friend", "buddy", "pal", "bro", "sis"],
  roommate: ["roommate", "roomie"],
  colleague: ["coworker", "colleague", "work buddy"],
  caregiver: ["caregiver", "carer"],
};

function normalize(value: string): string {
  return value.toLocaleLowerCase().trim().replace(/[’']/g, "").replace(/\s+/g, " ");
}

function kindForLabel(label: string): RelationshipKind | undefined {
  const normalized = normalize(label) as RelationshipKind;
  if (normalized in aliases) return normalized;
  for (const [kind, words] of Object.entries(aliases) as [RelationshipKind, string[]][]) {
    if (words.some((word) => normalize(word) === normalized)) return kind;
  }
  return undefined;
}

export interface AddressMatch {
  person: MemoryPerson;
  relationship: RelationshipKind;
  matchedAlias: string;
  confidence: number;
  relationshipId?: string;
}

export function resolveRelationshipAddress(
  graph: MemoryGraph,
  viewerPersonId: string,
  address: string,
): AddressMatch[] {
  const normalizedAddress = normalize(address);
  const matches: AddressMatch[] = [];
  const relationships = graph.relationships.filter((r) => r.fromPersonId === viewerPersonId);

  for (const relationship of relationships) {
    const kind = kindForLabel(relationship.label);
    if (!kind) continue;
    const person = graph.people.find((p) => p.id === relationship.toPersonId);
    if (!person) continue;

    const candidates = new Set<string>([
      ...aliases[kind],
      person.displayName,
      ...person.relationshipLabels,
    ].map(normalize));

    if (!candidates.has(normalizedAddress)) continue;

    matches.push({
      person,
      relationship: kind,
      matchedAlias: address,
      confidence: Math.min(1, relationship.confidence),
      relationshipId: relationship.id,
    });
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}

export function relationshipAliases(kind: RelationshipKind): string[] {
  return [...aliases[kind]];
}
