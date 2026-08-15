import type { MemoryGraph, MemoryKnowledgeState } from "./model.js";
import { corroborate, type CorroboratedFinding } from "./evidence-corroboration.js";
import { resolveRelationshipAddress, type RelationshipAddressMatch } from "./relationship-addressing.js";

export interface ResolvedInvestigatorQuery {
  query: string;
  subject?: RelationshipAddressMatch;
  finding?: CorroboratedFinding;
  gaps: string[];
  knowledgeState: MemoryKnowledgeState;
  ambiguous: boolean;
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

  if (!matches.length) {
    return {
      query,
      gaps: ["The person reference could not be resolved through the viewer's relationship graph."],
      knowledgeState: "unknown",
      ambiguous: false,
    };
  }

  const subject = matches[0];
  const ambiguous = matches.length > 1 && matches[1].confidence === subject.confidence;
  if (ambiguous) {
    return {
      query,
      gaps: ["The person reference matches multiple equally likely people."],
      knowledgeState: "unknown",
      ambiguous: true,
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
    ambiguous: false,
  };
}
