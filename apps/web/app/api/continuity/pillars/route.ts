import { NextResponse } from "next/server";
import { updateContinuityPillar } from "../../../../lib/continuity-pillar-store";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const pillarKey = typeof body.pillarKey === "string" ? body.pillarKey : "";
    const coverageScore = Number(body.coverageScore);
    const status = typeof body.status === "string" ? body.status : "";
    if (!pillarKey) return NextResponse.json({ error: "pillarKey is required." }, { status: 400 });
    return NextResponse.json(await updateContinuityPillar(pillarKey, coverageScore, status));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to update continuity pillar." },
      { status: 400 },
    );
  }
}
