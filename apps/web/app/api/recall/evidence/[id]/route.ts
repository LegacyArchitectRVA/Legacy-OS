import { NextResponse } from "next/server";
import { getRecallUserId } from "../../../../../lib/recall-store";
import { deleteRecallEvidence, updateRecallEvidence } from "../../../../../lib/recall-evidence-store";

const statuses = ["unverified", "verified", "disputed"] as const;
type Status = (typeof statuses)[number];
const isStatus = (value: unknown): value is Status => typeof value === "string" && statuses.includes(value as Status);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getRecallUserId(); if (!userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const { id } = await params;
  let body: Record<string, unknown>; try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  if (body.verificationStatus !== undefined && !isStatus(body.verificationStatus)) return NextResponse.json({ error: "Invalid verificationStatus." }, { status: 400 });
  if (body.provenance !== undefined && (!body.provenance || typeof body.provenance !== "object" || Array.isArray(body.provenance))) return NextResponse.json({ error: "provenance must be an object." }, { status: 400 });
  try {
    const evidence = await updateRecallEvidence(id, { label: typeof body.label === "string" ? body.label.trim() : undefined, description: typeof body.description === "string" ? body.description.trim() : undefined, capturedAt: typeof body.capturedAt === "string" ? body.capturedAt : undefined, provenance: body.provenance as Record<string, unknown> | undefined, verificationStatus: body.verificationStatus as Status | undefined }, userId);
    return evidence ? NextResponse.json({ evidence }) : NextResponse.json({ error: "Recall evidence not found." }, { status: 404 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update Recall evidence." }, { status: 500 }); }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getRecallUserId(); if (!userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const { id } = await params;
  try { return (await deleteRecallEvidence(id, userId)) ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: "Recall evidence not found." }, { status: 404 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete Recall evidence." }, { status: 500 }); }
}
