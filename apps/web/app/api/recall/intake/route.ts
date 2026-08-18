import { NextResponse } from "next/server";
import { isEvidenceClass, isRecallContext, normalizeRecallMemory, type RecallMemoryInput } from "../../../../lib/recall";
import { getRecallUserId, saveRecallMemory } from "../../../../lib/recall-store";

export async function POST(request: Request) {
  let body: Partial<RecallMemoryInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!isRecallContext(body.context)) return NextResponse.json({ error: "context must be personal, family, or business." }, { status: 400 });
  if (typeof body.title !== "string" || body.title.trim().length < 2) return NextResponse.json({ error: "title is required." }, { status: 400 });
  if (typeof body.narrative !== "string" || body.narrative.trim().length < 2) return NextResponse.json({ error: "narrative is required." }, { status: 400 });
  if (!isEvidenceClass(body.evidenceClass)) return NextResponse.json({ error: "evidenceClass must be known, reconstructed, inferred, or unknown." }, { status: 400 });
  if (body.confidence !== undefined && (typeof body.confidence !== "number" || !Number.isFinite(body.confidence))) return NextResponse.json({ error: "confidence must be a finite number between 0 and 1." }, { status: 400 });
  if (body.people !== undefined && (!Array.isArray(body.people) || body.people.some((value) => typeof value !== "string"))) return NextResponse.json({ error: "people must be an array of strings." }, { status: 400 });
  if (body.sourceRefs !== undefined && (!Array.isArray(body.sourceRefs) || body.sourceRefs.some((value) => typeof value !== "string"))) return NextResponse.json({ error: "sourceRefs must be an array of strings." }, { status: 400 });

  const userId = await getRecallUserId();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) {
    return NextResponse.json({ error: "Authentication is required to save Recall memories." }, { status: 401 });
  }

  try {
    const memory = await saveRecallMemory(normalizeRecallMemory(body as RecallMemoryInput), userId);
    return NextResponse.json({ accepted: true, durableStorage: Boolean(userId), memory }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save Recall memory." }, { status: 500 });
  }
}
