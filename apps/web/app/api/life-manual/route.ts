import { NextResponse } from "next/server";
import type { ContinuityPillarCoverage, ContinuityPillarKey } from "../../../lib/continuity";
import { getContinuityEngineState } from "../../../lib/continuity-pillar-store";
import { buildLifeManualDocument } from "../../../lib/life-manual";
import { listRecallMemories } from "../../../lib/recall-store";
import { listSuccessorActions } from "../../../lib/successor-action-store";
import { getAuthenticatedUser } from "../../../lib/supabase/server";

const PILLAR_KEYS = new Set<ContinuityPillarKey>([
  "digital_life",
  "financial_assets",
  "household_property",
  "health_medical",
  "vital_records",
  "business_continuity",
  "legacy_wishes",
]);

function toCoverage(
  pillars: Array<{ pillar_key: unknown; name?: unknown; coverage_score?: unknown; status?: unknown; matched_memories?: unknown }>,
): ContinuityPillarCoverage[] {
  return pillars.flatMap((pillar) => {
    if (typeof pillar.pillar_key !== "string" || !PILLAR_KEYS.has(pillar.pillar_key as ContinuityPillarKey)) return [];
    const status = pillar.status === "ready" || pillar.status === "in_progress" || pillar.status === "needs_attention"
      ? pillar.status
      : "needs_attention";
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

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  try {
    const [continuity, actions, memories] = await Promise.all([
      getContinuityEngineState(),
      listSuccessorActions(),
      listRecallMemories(undefined, user.id),
    ]);

    if (!continuity.snapshot) {
      return NextResponse.json({ error: "A continuity workspace is required." }, { status: 409 });
    }

    const document = buildLifeManualDocument({
      continuity: continuity.snapshot,
      pillars: toCoverage(continuity.pillars),
      actions,
      memories,
    });

    return NextResponse.json(document, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to generate Life Manual." },
      { status: 500 },
    );
  }
}
