import { NextResponse } from "next/server";
import { assessRecallIntelligence } from "../../../../../../lib/recall-intelligence";
import { getRecallUserId, getRecallMemoryById } from "../../../../../../lib/recall-store";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const userId = await getRecallUserId();

  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) {
    return NextResponse.json({ error: "Authentication is required to inspect Recall intelligence." }, { status: 401 });
  }

  try {
    const memory = await getRecallMemoryById(id, userId);
    if (!memory) return NextResponse.json({ error: "Recall memory not found." }, { status: 404 });

    return NextResponse.json({
      memoryId: memory.id,
      intelligence: assessRecallIntelligence(memory),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to assess Recall intelligence." }, { status: 500 });
  }
}
