import { NextResponse } from "next/server";
import { assessReconstructionReadiness, type PersonReconstructionProfile } from "../../../lib/person-reconstruction";
import { getAuthenticatedUser } from "../../../../lib/supabase/server";

const profiles = new Map<string, PersonReconstructionProfile>();

export async function GET(request: Request) {
  if (!await getAuthenticatedUser()) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing profile id" }, { status: 400 });
  const profile = profiles.get(id);
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  return NextResponse.json({ profile, readiness: assessReconstructionReadiness(profile) });
}

export async function POST(request: Request) {
  if (!await getAuthenticatedUser()) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const profile = (await request.json()) as PersonReconstructionProfile;
  if (!profile.id || !profile.displayName) return NextResponse.json({ error: "id and displayName are required" }, { status: 400 });
  profiles.set(profile.id, profile);
  return NextResponse.json({ profile, readiness: assessReconstructionReadiness(profile) }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!await getAuthenticatedUser()) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const body = (await request.json()) as Partial<PersonReconstructionProfile> & { id?: string };
  if (!body.id) return NextResponse.json({ error: "Missing profile id" }, { status: 400 });
  const existing = profiles.get(body.id);
  if (!existing) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  const profile = { ...existing, ...body, id: existing.id } as PersonReconstructionProfile;
  profiles.set(profile.id, profile);
  return NextResponse.json({ profile, readiness: assessReconstructionReadiness(profile) }, { status: 200 });
}
