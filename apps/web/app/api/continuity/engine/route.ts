import { NextResponse } from "next/server";
import { getContinuityEngineState, refreshContinuityPillars } from "../../../../lib/continuity-pillar-store";

export async function GET() {
  try {
    return NextResponse.json(await getContinuityEngineState());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load continuity engine." },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    return NextResponse.json(await refreshContinuityPillars());
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to refresh continuity engine." },
      { status: 500 },
    );
  }
}
