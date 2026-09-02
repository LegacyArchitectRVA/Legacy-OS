import { NextResponse } from "next/server";
import { getRecallMemoryById, getRecallUserId } from "../../../lib/recall-store";
import { listRecallEvidence, recallEvidenceTypes, recallVerificationStatuses, saveRecallEvidence } from "../../../lib/recall-evidence-store";

function isEvidenceType(value: unknown): value is (typeof recallEvidenceTypes)[number] { return typeof value === "string" && recallEvidenceTypes.includes(value as (typeof recallEvidenceTypes)[number]); }
function isVerificationStatus(value: unknown): value is (typeof recallVerificationStatuses)[number] { return typeof value === "string" && recallVerificationStatuses.includes(value as (typeof recallVerificationStatuses)[number]); }

export async function GET(request: Request) {
  const userId = await getRecallUserId(); if (!userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const memoryId = new URL(request.url).searchParams.get("memoryId")?.trim() ?? "";
  if (!memoryId) return NextResponse.json({ error: "memoryId is required." }, { status: 400 });
  if (!(await getRecallMemoryById(memoryId, userId))) return NextResponse.json({ error: "Recall memory not found." }, { status: 404 });
  try { return NextResponse.json({ evidence: await listRecallEvidence(memoryId, userId) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to retrieve Recall evidence." }, { status: 500 }); }
}

export async function POST(request: Request) {
  const userId = await getRecallUserId(); if (!userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  let body: Record<string, unknown>; try { body = await request.json(); } catch { return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }); }
  const memoryId = typeof body.memoryId === "string" ? body.memoryId.trim() : "";
  const type = body.type; const label = typeof body.label === "string" ? body.label.trim() : ""; const uri = typeof body.uri === "string" ? body.uri.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : undefined; const capturedAt = typeof body.capturedAt === "string" ? body.capturedAt.trim() : undefined;
  const verificationStatus = body.verificationStatus === undefined ? "unverified" : body.verificationStatus;
  if (!memoryId || !isEvidenceType(type) || !label || !uri || !isVerificationStatus(verificationStatus)) return NextResponse.json({ error: "memoryId, type, label, uri, and a valid verificationStatus are required." }, { status: 400 });
  if (!(await getRecallMemoryById(memoryId, userId))) return NextResponse.json({ error: "Recall memory not found." }, { status: 404 });
  try { const evidence = await saveRecallEvidence({ memoryId, type, label, uri, description, capturedAt, provenance: {}, verificationStatus }, userId); return NextResponse.json({ evidence }, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Recall evidence persistence failed." }, { status: 500 }); }
}
