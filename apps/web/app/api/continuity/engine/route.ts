import { NextResponse } from "next/server";
import { buildContinuityIntelligence } from "../../../../lib/continuity-intelligence";
import type { ContinuityPillarCoverage, ContinuityPillarKey } from "../../../../lib/continuity";
import { getContinuityEngineState, refreshContinuityPillars } from "../../../../lib/continuity-pillar-store";
import { getRecallUserId, listRecallMemories } from "../../../../lib/recall-store";

const PILLAR_KEYS = new Set<ContinuityPillarKey>([
  "digital_life",
  "emergency_successor_access",
  "financial_assets",
  "household_operations",
  "vital_records",
  "legacy_wishes",
  "business_continuity",
]);

function toCoverage(pillars: Array<{ pillar_key: unknown; name?: unknown; coverage_score?: unknown; status?: unknown; matched_memories?: unknown }>): ContinuityPillarCoverage[] {
  return pillars.flatMap((pillar) => {
    if (typeof pillar.pillar_key !== "string" || !PILLAR_KEYS.has(pillar.pillar_key as ContinuityPillarKey)) return [];
    const status = pillar.status === "ready" || pillar.status === "in_progress" || pillar.status === "needs_attention" ? pillar.status : "needs_attention";
    const coverageScore = typeof pillar.coverage_score === "number" && Number.isFinite(pillar.coverage_score)
      ? Math.max(0, Math.min(100, Math.round(pillar.coverage_score)))
      : 0;
    const matchedMemories = typeof pillar.matched_memories === "number" && Number.isFinite(pillar.matched_memories)
      ? Math.max(0, Math.floor(pillar.matched_memories))
      : 0;
    return [{
      pillarKey: pillar.pillar_key as ContinuityPillarKey,
      name: typeof pillar.name === "string" ? pillar.name : undefined,
      coverageScore,
      status,
      matchedMemories,
    }];
  });
}

async function withIntelligence(state: Awaited<ReturnType<typeof getContinuityEngineState>>) {
  const userId = await getRecallUserId();
  if (!userId) throw new Error("Authentication is required for continuity intelligence.");
  const memories = await listRecallMemories(undefined, userId);
  const intelligence = buildContinuityIntelligence(toCoverage(state.pillars), memories);
  return { ...state, intelligence };
}

export async function GET() {
  try {
    return NextResponse.json(await withIntelligence(await getContinuityEngineState()));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load continuity engine." },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    return NextResponse.json(await withIntelligence(await refreshContinuityPillars()));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to refresh continuity engine." },
      { status: 500 },
    );
  }
}
