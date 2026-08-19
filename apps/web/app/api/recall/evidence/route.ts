import { NextResponse } from "next/server";
import { getRecallMemoryById, getRecallUserId } from "../../../../lib/recall-store";
import { recallEvidenceTypes, saveRecallEvidence } from "../../../../lib/recall-evidence-store";

function isEvidenceType(value: unknown): value is (typeof recallEvidenceTypes)[number] {
  return typeof value === "string" && recallEvidenceTypes.includes(value as (typeof recallEvidenceTypes)[number]);
}

export async function POST(request: Request) {
  const userId = await getRecallUserId();
  if (!userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }

  const memoryId = typeof body.memoryId === "string" ? body.memoryId.trim() : "";
  const type = body.type;
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const uri = typeof body.uri === "string" ? body.uri.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : undefined;
  const capturedAt = typeof body.capturedAt === "string" ? body.capturedAt.trim() : undefined;

  if (!memoryId || !isEvidenceType(type) || !label || !uri) {
    return NextResponse.json({ error: "memoryId, type, label, and uri are required." }, { status: 400 });
  }

  const memory = await getRecallMemoryById(memoryId, userId);
  if (!memory) return NextResponse.json({ error: "Recall memory not found." }, { status: 404 });

  try {
    const evidence = await saveRecallEvidence({ memoryId, type, label, uri, description, capturedAt }, userId);
    return NextResponse.json({ evidence }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Recall evidence persistence failed." }, { status: 500 });
  }
}
