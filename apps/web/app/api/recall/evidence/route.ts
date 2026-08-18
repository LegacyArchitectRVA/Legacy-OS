import { NextResponse } from "next/server";
import { getRecallUserId } from "../../../lib/recall-store";
import { getRecallMemoryById } from "../../../lib/recall-store";

const evidenceTypes = ["document", "photo", "audio", "video", "link", "note"] as const;
type EvidenceType = (typeof evidenceTypes)[number];

function isEvidenceType(value: unknown): value is EvidenceType {
  return typeof value === "string" && evidenceTypes.includes(value as EvidenceType);
}

export async function POST(request: Request) {
  const userId = await getRecallUserId();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }

  const memoryId = typeof body.memoryId === "string" ? body.memoryId.trim() : "";
  const type = body.type;
  const label = typeof body.label === "string" ? body.label.trim() : "";
  const uri = typeof body.uri === "string" ? body.uri.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : undefined;

  if (!memoryId || !isEvidenceType(type) || !label || !uri) {
    return NextResponse.json({ error: "memoryId, type, label, and uri are required." }, { status: 400 });
  }

  const memory = await getRecallMemoryById(memoryId, userId);
  if (!memory) return NextResponse.json({ error: "Recall memory not found." }, { status: 404 });

  return NextResponse.json({
    evidence: {
      id: crypto.randomUUID(), memoryId, type, label, uri,
      description, createdAt: new Date().toISOString(),
    },
  }, { status: 201 });
}
