import { NextResponse } from "next/server";
import { buildRecreationResponse, type MemoryRecreationRequest, type RecreationPerson, type RecreationScene, type RecreationSource } from "../../../lib/memory-recreation";

const demoPerson: RecreationPerson = {
  id: "demo-dad",
  displayName: "Dad",
  approvedForRecreation: true,
  sources: [
    { id: "memory-fishing", type: "memory", title: "The first fishing trip", evidence: "verified" },
    { id: "photo-fishing", type: "photo", title: "Fishing trip photograph", evidence: "verified" },
  ],
};

const demoScene: RecreationScene = {
  id: "first-fishing-trip",
  title: "The first fishing trip",
  location: "Family lake",
  sourceIds: ["memory-fishing", "photo-fishing"],
  confidence: 0.92,
};

export async function POST(request: Request) {
  let body: Partial<MemoryRecreationRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body.personId !== "string" || body.personId.trim().length < 1) {
    return NextResponse.json({ error: "personId is required." }, { status: 400 });
  }
  if (typeof body.prompt !== "string" || body.prompt.trim().length < 2) {
    return NextResponse.json({ error: "prompt is required." }, { status: 400 });
  }

  if (body.personId !== demoPerson.id) {
    return NextResponse.json({ error: "Person recreation is not available for this person yet." }, { status: 404 });
  }

  const sources: RecreationSource[] = demoPerson.sources;
  const scene = body.sceneId === demoScene.id ? demoScene : undefined;
  const result = buildRecreationResponse(demoPerson, body.prompt, sources, scene);

  return NextResponse.json(result, { status: 200 });
}
