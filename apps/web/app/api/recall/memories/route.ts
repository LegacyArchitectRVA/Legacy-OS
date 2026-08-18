import { NextResponse } from "next/server";
import { type RecallContext } from "../../../../lib/recall";
import { getRecallUserId, listRecallMemories } from "../../../../lib/recall-store";

function parseRecallContext(value: string | null): RecallContext | undefined {
  if (value === null) return undefined;
  if (value === "personal" || value === "family" || value === "business") return value;
  return undefined;
}

export async function GET(request: Request) {
  const rawContext = new URL(request.url).searchParams.get("context");
  const context = parseRecallContext(rawContext);

  if (rawContext !== null && context === undefined) {
    return NextResponse.json({ error: "context must be personal, family, or business." }, { status: 400 });
  }

  const userId = await getRecallUserId();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) {
    return NextResponse.json({ error: "Authentication is required to retrieve Recall memories." }, { status: 401 });
  }

  try {
    return NextResponse.json({ memories: await listRecallMemories(context, userId) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to retrieve Recall memories." }, { status: 500 });
  }
}
