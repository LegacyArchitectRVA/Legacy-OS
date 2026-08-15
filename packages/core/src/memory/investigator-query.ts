import type { MemoryGraph, MemoryKnowledgeState } from "./model.js";
import { corroborate, type CorroboratedFinding } from "./evidence-corroboration.js";
import { resolveRelationshipAddress, type AddressMatch } from "./relationship-addressing.js";

export interface ResolvedInvestigatorQuery {
  query: string;
  subject?: AddressMatch;
  finding?: CorroboratedFinding;
  gaps: string[];
  knowledgeState: MemoryKnowledgeState;
}

function extractReference(query: string): string | undefined {
  const match = query.match(/\b(?:what did|where was|what was|when did|did)\s+([\w'-]+(?:\s+[\w'-]+)?)\b/i);
  return match?.[1];
}

export function resolveInvestigatorQuery(
  graph: MemoryGraph,
  viewerPersonId: string,
  query: string,
): ResolvedInvestigatorQuery {
  const reference = extractReference(query);
  const matches = reference ? resolveRelationshipAddress(graph, viewerPersonId, reference) : [];
  const subject = matches[0];

  if (!subject) {
    return {
      query,
      gaps: ["The person reference could not be resolved through the viewer's relationship graph."],
      knowledgeState: "unknown",
    };
  }

  const memories = graph.memories.filter((memory) => memory.subjectPersonId === subject.person.id);
  const evidence = memories.flatMap((memory) => memory.evidence);
  const finding = corroborate({ statement: memories[0]?.summary ?? query, evidence });

  return {
    query,
    subject,
    finding,
    gaps: finding.gaps,
    knowledgeState: finding.knowledgeState,
  };
}
