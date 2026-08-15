import type { MemoryGraph, MemoryRelationship, MemoryVisibility } from "../memory/model.js";

export interface EchoSession { viewerPersonId: string; subjectPersonId: string; authorized: boolean; startedAt: string; }
export interface EchoTurn { question: string; answer: string; memoryIds: string[]; evidenceSourceIds: string[]; grounded: boolean; }
export interface EchoSessionResult { session: EchoSession; turn: EchoTurn; }
export interface SessionQuery { viewerPersonId: string; subjectPersonId: string; question: string; }

function relationshipAllowsAccess(r: MemoryRelationship, viewer: string, subject: string): boolean {
  return r.fromPersonId === viewer && r.toPersonId === subject && r.confidence >= 0.8;
}
function visibleToViewer(v: MemoryVisibility, viewerIsSubject: boolean): boolean {
  if (viewerIsSubject) return true;
  return v === "family" || v === "successor" || v === "public";
}

export function startEchoSession(graph: MemoryGraph, query: SessionQuery, startedAt: string): EchoSession {
  if (!graph.people.some(p => p.id === query.viewerPersonId) || !graph.people.some(p => p.id === query.subjectPersonId)) {
    throw new Error("Unknown Echo session participant");
  }
  const viewerIsSubject = query.viewerPersonId === query.subjectPersonId;
  const authorized = viewerIsSubject || graph.relationships.some(r => relationshipAllowsAccess(r, query.viewerPersonId, query.subjectPersonId));
  return { viewerPersonId: query.viewerPersonId, subjectPersonId: query.subjectPersonId, authorized, startedAt };
}

export function answerEchoQuestion(graph: MemoryGraph, session: EchoSession, question: string): EchoTurn {
  if (!session.authorized) return { question, answer: "I can't share that person's private legacy information with you.", memoryIds: [], evidenceSourceIds: [], grounded: false };
  const viewerIsSubject = session.viewerPersonId === session.subjectPersonId;
  const terms = question.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matches = graph.memories.filter(memory => {
    if (memory.subjectPersonId !== session.subjectPersonId || !visibleToViewer(memory.visibility, viewerIsSubject)) return false;
    const haystack = `${memory.title} ${memory.summary} ${memory.tags.join(" ")}`.toLowerCase();
    return terms.some(term => term.length > 2 && haystack.includes(term));
  });
  if (!matches.length) return { question, answer: "I don't have enough authorized evidence to answer that.", memoryIds: [], evidenceSourceIds: [], grounded: false };
  const memory = matches[0]!;
  const evidenceSourceIds = memory.evidence.map(e => e.sourceId);
  return { question, answer: `I found something in the available evidence: ${memory.summary}`, memoryIds: [memory.id], evidenceSourceIds, grounded: evidenceSourceIds.length > 0 };
}
