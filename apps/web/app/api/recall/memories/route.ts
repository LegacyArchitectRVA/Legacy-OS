import { NextResponse } from "next/server";
import { isRecallContext, type RecallContext } from "../../../../lib/recall";
import { getRecallUserId, listRecallMemories } from "../../../../lib/recall-store";

export async function GET(request: Request) {
  const rawContext = new URL(request.url).searchParams.get("context");

  if (rawContext !== null && !isRecallContext(rawContext)) {
    return NextResponse.json({ error: "context must be personal, family, or business." }, { status: 400 });
  }

  const context: RecallContext | undefined = rawContext === null ? undefined : (rawContext as RecallContext);
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
