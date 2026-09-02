import { NextResponse } from "next/server";
import { buildRecreationResponse, type MemoryRecreationRequest, type RecreationPerson, type RecreationScene, type RecreationSource } from "../../../lib/memory-recreation";
import { getRecallUserId, listRecallMemories } from "../../../../lib/recall-store";
import { listRecallEvidence } from "../../../../lib/recall-evidence-store";

function normalizePerson(value: string) { return value.trim().toLowerCase(); }

function jsonNoStore<T>(body: T, init?: ResponseInit) {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function POST(request: Request) {
  const userId = await getRecallUserId();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) return jsonNoStore({ error: "Authentication is required for person recreation." }, { status: 401 });
  if (!userId) return jsonNoStore({ error: "Persistent Recall storage is required for person recreation." }, { status: 503 });

  let body: Partial<MemoryRecreationRequest>;
  try { body = await request.json(); } catch { return jsonNoStore({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (typeof body.personId !== "string" || body.personId.trim().length < 1) return jsonNoStore({ error: "personId is required." }, { status: 400 });
  if (typeof body.prompt !== "string" || body.prompt.trim().length < 2) return jsonNoStore({ error: "prompt is required." }, { status: 400 });

  try {
    const memories = await listRecallMemories(undefined, userId);
    const personId = normalizePerson(body.personId);
    const related = memories.filter((memory) => (memory.people ?? []).some((person) => normalizePerson(person) === personId));
    if (!related.length) return jsonNoStore({ error: "No preserved memories were found for this person." }, { status: 404 });

    const displayName = related.flatMap((memory) => memory.people ?? []).find((person): person is string => typeof person === "string" && normalizePerson(person) === personId) ?? body.personId.trim();
    const prompt = body.prompt.trim();
    const evidence = (await Promise.all(related.map((memory) => listRecallEvidence(memory.id, userId)))).flat();
    const sources: RecreationSource[] = [
      ...related.map((memory) => ({ id: memory.id, type: "memory" as const, title: memory.title, evidence: memory.evidenceClass === "known" ? "verified" as const : memory.evidenceClass === "inferred" ? "inferred" as const : "reconstructed" as const })),
      ...evidence.map((item) => ({ id: item.id, type: item.type === "link" || item.type === "note" ? "document" as const : item.type, title: item.label, uri: item.uri, evidence: item.verificationStatus === "verified" ? "verified" as const : "unknown" as const })),
    ];
    const person: RecreationPerson = { id: personId, displayName, approvedForRecreation: true, sources };
    const scene: RecreationScene | undefined = body.sceneId ? { id: body.sceneId, title: body.sceneId, sourceIds: sources.map((source) => source.id), confidence: related.reduce((sum, memory) => sum + (memory.confidence ?? 0.5), 0) / related.length } : undefined;
    return jsonNoStore(buildRecreationResponse(person, prompt, sources, scene));
  } catch (error) {
    return jsonNoStore({ error: error instanceof Error ? error.message : "Unable to build recreation response." }, { status: 500 });
  }
}
