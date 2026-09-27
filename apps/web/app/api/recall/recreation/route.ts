import { NextResponse } from "next/server";
import { buildRecreationResponse, type MemoryRecreationRequest, type RecreationPerson, type RecreationScene, type RecreationSource } from "../../../lib/memory-recreation";
import { getRecallUserId, listRecallMemories } from "../../../../lib/recall-store";
import { listRecallEvidence } from "../../../../lib/recall-evidence-store";
import { getSceneContext } from "../../../../lib/context-enrichment";

const MAX_PROMPT_CHARS = 2_000;

function normalizePerson(value: string) { return value.trim().toLowerCase(); }

export async function POST(request: Request) {
  const userId = await getRecallUserId();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) return NextResponse.json({ error: "Authentication is required for person recreation." }, { status: 401 });
  if (!userId) return NextResponse.json({ error: "Persistent Recall storage is required for person recreation." }, { status: 503 });

  let body: Partial<MemoryRecreationRequest>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (typeof body.personId !== "string" || body.personId.trim().length < 1) return NextResponse.json({ error: "personId is required." }, { status: 400 });
  if (typeof body.prompt !== "string" || body.prompt.trim().length < 2) return NextResponse.json({ error: "prompt is required." }, { status: 400 });
  if (body.prompt.length > MAX_PROMPT_CHARS) return NextResponse.json({ error: `prompt must be ${MAX_PROMPT_CHARS.toLocaleString()} characters or fewer.` }, { status: 413 });

  try {
    const memories = await listRecallMemories(undefined, userId);
    const personId = normalizePerson(body.personId);
    const related = memories.filter((memory) => (memory.people ?? []).some((person) => normalizePerson(person) === personId));
    if (!related.length) return NextResponse.json({ error: "No preserved memories were found for this person." }, { status: 404 });

    const displayName = related.flatMap((memory) => memory.people ?? []).find((person): person is string => typeof person === "string" && normalizePerson(person) === personId) ?? body.personId.trim();
    const prompt = body.prompt.trim();
    const evidence = (await Promise.all(related.map((memory) => listRecallEvidence(memory.id, userId)))).flat();

    const sources: RecreationSource[] = [
      ...related.map((memory) => ({
        id: memory.id,
        type: "memory" as const,
        title: memory.title,
        evidence: memory.evidenceClass === "known" ? "verified" as const : memory.evidenceClass === "inferred" ? "inferred" as const : memory.evidenceClass === "reconstructed" ? "reconstructed" as const : "unknown" as const,
        detail: memory.narrative,
      })),
      ...evidence.map((item) => ({
        id: item.id,
        type: item.type === "link" || item.type === "note" ? "document" as const : item.type,
        title: item.label,
        uri: item.uri,
        evidence: item.verificationStatus === "verified" ? "verified" as const : item.verificationStatus === "disputed" ? "unknown" as const : "unknown" as const,
        detail: item.description,
      })),
    ];

    const person: RecreationPerson = { id: personId, displayName, approvedForRecreation: true, sources };

    // A scene is the most recent related memory with both a place and a date,
    // so we can look up what actually happened there (right now: weather).
    const sceneMemory = related.find((memory) => memory.location && memory.occurredAt) ?? related[0];
    const scene: RecreationScene | undefined = body.sceneId
      ? { id: body.sceneId, title: body.sceneId, sourceIds: sources.map((source) => source.id), confidence: related.reduce((sum, memory) => sum + (memory.confidence ?? 0.5), 0) / related.length }
      : sceneMemory.location
        ? { id: sceneMemory.id, title: sceneMemory.title, location: sceneMemory.location, date: sceneMemory.occurredAt, sourceIds: [sceneMemory.id], confidence: sceneMemory.confidence ?? 0.5 }
        : undefined;

    const sceneContext = scene ? await getSceneContext(scene.location, scene.date) : null;

    const result = await buildRecreationResponse(person, prompt, sources, scene, sceneContext);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to build recreation response." }, { status: 500 });
  }
}
