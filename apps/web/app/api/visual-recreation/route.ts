import { NextResponse } from "next/server";
import { getRecallUserId, listRecallMemories } from "../../../lib/recall-store";
import { buildVisualRecreation } from "../../../lib/visual-recreation";

export async function GET() { const userId = await getRecallUserId(); if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 }); try { const memories = await listRecallMemories(undefined, userId); return NextResponse.json(buildVisualRecreation(memories)); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to build visual recreation." }, { status: 500 }); } }
