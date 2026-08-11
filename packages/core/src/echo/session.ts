import type { MemoryGraph } from "../memory/model.js";

export interface EchoSession {
  viewerPersonId: string;
  subjectPersonId: string;
  authorized: boolean;
  startedAt: string;
}

export interface EchoTurn {
  question: string;
  answer: string;
  memoryIds: string[];
  evidenceSourceIds: string[];
  grounded: boolean;
}

export interface EchoSessionResult {
  session: EchoSession;
  turn: EchoTurn;
}

export interface SessionQuery {
  viewerPersonId: string;
  subjectPersonId: string;
  question: string;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function startEchoSession(
  graph: MemoryGraph,
  query: SessionQuery,
  startedAt: string,
): EchoSession {
  const viewerExists = graph.people.some((person) => person.id === query.viewerPersonId);
  const subjectExists = graph.people.some((person) => person.id === query.subjectPersonId);
  if (!viewerExists || !subjectExists) throw new Error("Unknown Echo session participant");

  const authorized =
    query.viewerPersonId === query.subjectPersonId ||
    graph.relationships.some(
      (relationship) =>
        (relationship.fromPersonId === query.viewerPersonId && relationship.toPersonId === query.subjectPersonId) ||
        (relationship.fromPersonId === query.subjectPersonId && relationship.toPersonId === query.viewerPersonId),
    );

  return { viewerPersonId: query.viewerPersonId, subjectPersonId: query.subjectPersonId, authorized, startedAt };
}

export function answerEchoQuestion(
  graph: MemoryGraph,
  session: EchoSession,
  question: string,
): EchoTurn {
  if (!session.authorized) {
    return { question, answer: "I can't share that person's private legacy information with you.", memoryIds: [], evidenceSourceIds: [], grounded: false };
  }

  const terms = normalize(question).split(/\s+/).filter(Boolean);
  const matches = graph.memories.filter((memory) => {
    if (memory.subjectPersonId !== session.subjectPersonId || memory.visibility !== "private") return false;
    const haystack = normalize(`${memory.title} ${memory.summary} ${memory.tags.join(" ")}`);
    return terms.some((term) => term.length > 2 && haystack.includes(term));
  });

  if (matches.length === 0) {
    return { question, answer: "I don't have enough evidence to answer that.", memoryIds: [], evidenceSourceIds: [], grounded: false };
  }

  const memory = matches[0]!;
  const evidenceSourceIds = memory.evidence.map((evidence) => evidence.sourceId);
  return {
    question,
    answer: `I found something in the memories: ${memory.summary}`,
    memoryIds: [memory.id],
    evidenceSourceIds,
    grounded: evidenceSourceIds.length > 0,
  };
}
