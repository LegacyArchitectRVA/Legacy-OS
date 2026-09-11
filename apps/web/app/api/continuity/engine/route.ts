import { NextResponse } from "next/server";
import { buildContinuityIntelligence } from "../../../../lib/continuity-intelligence";
import { getContinuityEngineState, refreshContinuityPillars } from "../../../../lib/continuity-pillar-store";

export async function GET() {
  try {
    const state = await getContinuityEngineState();
    const intelligence = buildContinuityIntelligence(state.pillars, state.memories);
    return NextResponse.json({ ...state, intelligence });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load continuity engine." },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const state = await refreshContinuityPillars();
    const intelligence = buildContinuityIntelligence(state.pillars, state.memories);
    return NextResponse.json({ ...state, intelligence });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to refresh continuity engine." },
      { status: 500 },
    );
  }
}
