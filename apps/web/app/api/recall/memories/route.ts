import { NextResponse } from "next/server";
import { isRecallContext, type RecallContext } from "../../../../lib/recall";
import { listRecallMemories } from "../../../../lib/recall-store";

export async function GET(request: Request) {
  const rawContext = new URL(request.url).searchParams.get("context");

  if (rawContext !== null && !isRecallContext(rawContext)) {
    return NextResponse.json({ error: "context must be personal, family, or business." }, { status: 400 });
  }

  const context: RecallContext | undefined = rawContext === null ? undefined : (rawContext as RecallContext);
  return NextResponse.json({ memories: listRecallMemories(context) });
}
