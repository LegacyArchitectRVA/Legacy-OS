import { authorizeEchoAccess, canAccessMemory } from "../memory/access.js";
import type { EchoConsentGrant } from "../memory/consent.js";
import type { MemoryGraph, MemoryVisibility } from "../memory/model.js";

export interface EchoSession {
  viewerPersonId: string;
  subjectPersonId: string;
  authorized: boolean;
  startedAt: string;
  authorization: ReturnType<typeof authorizeEchoAccess>;
}

export interface EchoTurn {
  question: string;
  answer: string;
  memoryIds: string[];
  evidenceSourceIds: string[];
  grounded: boolean;
}

export interface EchoSessionResult { session: EchoSession; turn: EchoTurn; }
export interface SessionQuery {
  viewerPersonId: string;
  subjectPersonId: string;
  question: string;
  allowedVisibility?: MemoryVisibility;
  grants?: EchoConsentGrant[];
}

export function startEchoSession(graph: MemoryGraph, query: SessionQuery, startedAt: string): EchoSession {
  if (!graph.people.some(p => p.id === query.viewerPersonId) || !graph.people.some(p => p.id === query.subjectPersonId)) {
    throw new Error("Unknown Echo session participant");
  }

  const authorization = authorizeEchoAccess(
    graph,
    {
      viewerPersonId: query.viewerPersonId,
      subjectPersonId: query.subjectPersonId,
      query: query.question,
    },
    query.allowedVisibility ?? "family",
    query.grants ?? [],
    startedAt,
  );

  return {
    viewerPersonId: query.viewerPersonId,
    subjectPersonId: query.subjectPersonId,
    authorized: authorization.relationshipVerified && authorization.consentVerified,
    startedAt,
    authorization,
  };
}

export function answerEchoQuestion(graph: MemoryGraph, session: EchoSession, question: string): EchoTurn {
  const terms = question.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = graph.memories.filter(memory => {
    if (memory.subjectPersonId !== session.subjectPersonId) return false;
    const access = canAccessMemory(memory, session.authorization);
    if (!access.allowed) return false;
    const haystack = `${memory.title} ${memory.summary} ${memory.tags.join(" ")}`.toLowerCase();
    return terms.some(term => term.length > 2 && haystack.includes(term));
  });

  if (!matches.length) {
    return {
      question,
      answer: session.authorized
        ? "I don't have enough authorized evidence to answer that."
        : "I can't share that person's private legacy information with you.",
      memoryIds: [],
      evidenceSourceIds: [],
      grounded: false,
    };
  }

  const memory = matches[0]!;
  const evidenceSourceIds = memory.evidence.map(e => e.sourceId);
  return {
    question,
    answer: `I found something in the available evidence: ${memory.summary}`,
    memoryIds: [memory.id],
    evidenceSourceIds,
    grounded: evidenceSourceIds.length > 0,
  };
}
