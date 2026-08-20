import { NextResponse } from "next/server";
import { isRecallContext, type RecallContext } from "../../../../lib/recall";
import { assessRecallIntelligence } from "../../../../lib/recall-intelligence";
import { getRecallUserId, listRecallMemories } from "../../../../lib/recall-store";

function parseRecallContext(value: string | null): RecallContext | undefined {
  if (value === null) return undefined;
  return isRecallContext(value) ? value : undefined;
}

export async function GET(request: Request) {
  const rawContext = new URL(request.url).searchParams.get("context");
  const context: RecallContext | undefined = parseRecallContext(rawContext);

  if (rawContext !== null && context === undefined) {
    return NextResponse.json({ error: "context must be personal, family, or business." }, { status: 400 });
  }

  const userId = await getRecallUserId();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) {
    return NextResponse.json({ error: "Authentication is required to retrieve Recall memories." }, { status: 401 });
  }

  try {
    const memories = await listRecallMemories(context, userId);
    return NextResponse.json({
      memories: memories.map((memory) => ({
        ...memory,
        intelligence: assessRecallIntelligence(memory),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to retrieve Recall memories." }, { status: 500 });
  }
}
