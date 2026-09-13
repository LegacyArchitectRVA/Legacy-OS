import { NextResponse } from "next/server";
import { getContinuityEngineState } from "../../../lib/continuity-pillar-store";

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(request: Request) {
  try {
    const workspaceId = new URL(request.url).searchParams.get("workspace_id");
    return NextResponse.json(await getContinuityEngineState(workspaceId), { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Unable to load continuity readiness." },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
