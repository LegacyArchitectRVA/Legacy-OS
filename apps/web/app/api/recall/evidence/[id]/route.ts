import { NextResponse } from "next/server";
import { getRecallMemoryById, getRecallUserId } from "../../../../../lib/recall-store";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getRecallUserId();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const { id } = await params;
  const url = new URL(request.url);
  const memoryId = url.searchParams.get("memoryId")?.trim();
  if (!memoryId) return NextResponse.json({ error: "memoryId is required." }, { status: 400 });
  const memory = await getRecallMemoryById(memoryId, userId);
  if (!memory) return NextResponse.json({ error: "Recall memory not found." }, { status: 404 });
  return NextResponse.json({ evidence: { id, memoryId } });
}
