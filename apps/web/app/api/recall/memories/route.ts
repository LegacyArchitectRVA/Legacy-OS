import { NextResponse } from "next/server";
import { isRecallContext } from "../../../../lib/recall";
import { listRecallMemories } from "../../../../lib/recall-store";

export async function GET(request: Request) {
  const context = new URL(request.url).searchParams.get("context") ?? undefined;
  if (context !== undefined && !isRecallContext(context)) {
    return NextResponse.json({ error: "context must be personal, family, or business." }, { status: 400 });
  }

  return NextResponse.json({ memories: listRecallMemories(context) });
}
