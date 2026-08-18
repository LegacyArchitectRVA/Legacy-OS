import { NextResponse } from "next/server";
import { isEvidenceClass, isRecallContext, normalizeRecallMemory, type RecallMemoryInput } from "../../../../lib/recall";

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

  const memory = normalizeRecallMemory(body as RecallMemoryInput);
  return NextResponse.json({ accepted: true, durableStorage: false, memory }, { status: 202 });
}
