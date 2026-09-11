import { NextResponse } from "next/server";
import { getContinuityEngineState } from "../../../lib/continuity-pillar-store";

export async function GET() {
  try {
    return NextResponse.json(await getContinuityEngineState());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load continuity readiness." }, { status: 500 });
  }
}
