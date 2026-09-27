import { NextResponse } from "next/server";
import { assessRecallIntelligence } from "../../../../../lib/recall-intelligence";
import { isEvidenceClass } from "../../../../../lib/recall";
import { deleteRecallMemory, getRecallMemoryById, getRecallUserId, updateRecallMemory } from "../../../../../lib/recall-store";

function requireUserId() { return getRecallUserId(); }

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  try {
    const { id } = await params;
    const memory = await getRecallMemoryById(id, userId);
    if (!memory) return NextResponse.json({ error: "Recall memory not found." }, { status: 404 });
    return NextResponse.json({ memory, intelligence: assessRecallIntelligence(memory) });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to retrieve Recall memory." }, { status: 500 }); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (body.evidenceClass !== undefined && !isEvidenceClass(body.evidenceClass)) return NextResponse.json({ error: "Invalid evidenceClass." }, { status: 400 });
  if (body.confidence !== undefined && body.confidence !== null && (typeof body.confidence !== "number" || body.confidence < 0 || body.confidence > 1)) return NextResponse.json({ error: "confidence must be between 0 and 1." }, { status: 400 });
  const allowed = ["title", "narrative", "occurredAt", "location", "people", "sourceRefs", "evidenceClass", "confidence", "provenanceComplete"];
  const updates = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No editable fields supplied." }, { status: 400 });
  try {
    const { id } = await params;
    const memory = await updateRecallMemory(id, updates, userId);
    if (!memory) return NextResponse.json({ error: "Recall memory not found." }, { status: 404 });
    return NextResponse.json({ memory, intelligence: assessRecallIntelligence(memory) });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update Recall memory." }, { status: 500 }); }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  try {
    const { id } = await params;
    const deleted = await deleteRecallMemory(id, userId);
    if (!deleted) return NextResponse.json({ error: "Recall memory not found." }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete Recall memory." }, { status: 500 }); }
}
