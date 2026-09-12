import { NextResponse } from "next/server";
import { getContinuityEngineState } from "../../../lib/continuity-pillar-store";
import { buildLifeManualDocument } from "../../../lib/life-manual";
import { listRecallMemories } from "../../../lib/recall-store";
import { listSuccessorActions } from "../../../lib/successor-action-store";
import { getAuthenticatedUser } from "../../../lib/supabase/server";

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
      pillars: continuity.pillars,
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
