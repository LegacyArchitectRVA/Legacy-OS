import type {
  Memory,
  MemoryGraph,
  MemoryMatch,
  MemoryQueryContext,
  MemoryRelationship,
  MemoryResponse,
} from "./model.js";

const visibilityRank = {
  private: 0,
  trusted: 1,
  family: 2,
  successor: 3,
} as const;

export function relationshipBetween(
  graph: MemoryGraph,
  viewerPersonId: string,
  subjectPersonId: string,
): MemoryRelationship | undefined {
  return graph.relationships.find(
    (relationship) =>
      relationship.fromPersonId === subjectPersonId &&
      relationship.toPersonId === viewerPersonId,
  );
}

function scoreMemory(
  memory: Memory,
  query: string,
  relationship: MemoryRelationship | undefined,
): number {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = [
    memory.title,
    memory.summary,
    memory.location ?? "",
    ...memory.tags,
  ].join(" ").toLowerCase();

  const matched = terms.filter((term) => haystack.includes(term));
  const lexicalScore = terms.length === 0 ? 0 : matched.length / terms.length;

  // Query relevance is a hard gate. Relationship strength, evidence quality,
  // and confidence may rank relevant memories, but can never turn a weakly
  // related or unrelated memory into an answer.
  if (terms.length > 0 && (matched.length === 0 || lexicalScore < 0.2)) return 0;

  const relationshipScore =
    relationship && memory.participantIds.includes(relationship.toPersonId)
      ? 0.25
      : 0;
  const evidenceScore = Math.min(memory.evidence.length / 4, 0.25);

  return Math.min(
    1,
    lexicalScore * 0.5 + relationshipScore + evidenceScore + memory.confidence * 0.25,
  );
}

export function queryMemories(
  graph: MemoryGraph,
  context: MemoryQueryContext,
): MemoryMatch[] {
  const relationship = relationshipBetween(
    graph,
    context.viewerPersonId,
    context.subjectPersonId,
  );

  return graph.memories
    .filter((memory) => memory.subjectPersonId === context.subjectPersonId)
    .filter((memory) => visibilityRank[memory.visibility] >= 1)
    .map((memory) => ({
      memory,
      score: scoreMemory(memory, context.query, relationship),
      matchedEvidence: memory.evidence,
      relationshipRelevance:
        relationship && memory.participantIds.includes(context.viewerPersonId)
          ? 1
          : 0,
    }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function buildMemoryResponse(
  graph: MemoryGraph,
  context: MemoryQueryContext,
): MemoryResponse {
  const matches = queryMemories(graph, context).slice(0, 5);
  const strongest = matches[0];

  if (!strongest) {
    return {
      answer: "There is not enough evidence to answer that memory accurately.",
      matches: [],
      disclosure: {
        knowledgeState: "unknown",
        confidence: 0,
        evidenceCount: 0,
      },
    };
  }

  const memory = strongest.memory;
  const relationship = relationshipBetween(
    graph,
    context.viewerPersonId,
    context.subjectPersonId,
  );
  const relationshipLead = relationship?.label
    ? `As ${relationship.label}, `
    : "";
  const answer = `${relationshipLead}${memory.summary}`;

  return {
    answer,
    matches,
    disclosure: {
      knowledgeState: memory.knowledgeState,
      confidence: memory.confidence,
      evidenceCount: memory.evidence.length,
    },
  };
}
