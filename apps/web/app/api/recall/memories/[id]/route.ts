import { NextResponse } from "next/server";
import { getRecallUserId } from "../../../../../lib/recall-store";
import { deleteRecallMemory, getRecallMemoryById, updateRecallMemory } from "../../../../../lib/recall-store";

function requireUserId() {
  return getRecallUserId();
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  try {
    const { id } = await params;
    const memory = await getRecallMemoryById(id, userId);
    if (!memory) return NextResponse.json({ error: "Recall memory not found." }, { status: 404 });
    return NextResponse.json({ memory });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to retrieve Recall memory." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  const allowed = ["title", "narrative", "occurredAt", "people", "sourceRefs", "evidenceClass", "confidence", "provenanceComplete"];
  const updates = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)));
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No editable fields supplied." }, { status: 400 });
  try {
    const { id } = await params;
    const memory = await updateRecallMemory(id, updates, userId);
    if (!memory) return NextResponse.json({ error: "Recall memory not found." }, { status: 404 });
    return NextResponse.json({ memory });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update Recall memory." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  try {
    const { id } = await params;
    const deleted = await deleteRecallMemory(id, userId);
    if (!deleted) return NextResponse.json({ error: "Recall memory not found." }, { status: 404 });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete Recall memory." }, { status: 500 });
  }
}
