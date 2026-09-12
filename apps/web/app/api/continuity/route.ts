import { NextResponse } from "next/server";
import { getContinuityEngineState } from "../../../lib/continuity-pillar-store";

const NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export async function GET() {
  try {
    return NextResponse.json(await getContinuityEngineState(), { headers: NO_STORE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Unable to load continuity readiness." },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
