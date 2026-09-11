import OpenAI from "openai";
import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../lib/supabase/server";
import { getContinuityEngineState } from "../../../lib/continuity-pillar-store";
import { listRecallMemories } from "../../../lib/recall-store";
import { buildLegacyOsVoiceInstruction, getLegacyOsVoiceMode } from "../../../lib/legacyos-voice";

const MAX_MEMORIES = 40;
const MAX_MEMORY_CHARS = 1200;

function buildContext(memories: Awaited<ReturnType<typeof listRecallMemories>>, continuity: Awaited<ReturnType<typeof getContinuityEngineState>>) {
  const memoryContext = memories.slice(0, MAX_MEMORIES).map((memory) => ({
    title: memory.title,
    context: memory.context,
    narrative: memory.narrative.slice(0, MAX_MEMORY_CHARS),
    people: memory.people,
    evidenceClass: memory.evidenceClass,
    confidence: memory.confidence,
    provenanceComplete: memory.provenanceComplete,
  }));

  return JSON.stringify({
    continuity: continuity.readiness,
    pillars: continuity.pillars.map((pillar) => ({
      key: pillar.pillar_key,
      name: pillar.name,
      coverage: pillar.coverage_score,
      status: pillar.status,
    })),
    nextActions: continuity.actions.slice(0, 12),
    memories: memoryContext,
  });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  const body = await request.json();
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const workspace = typeof body?.workspace === "string" ? body.workspace : null;
  if (!message) return NextResponse.json({ error: "A message is required." }, { status: 400 });

  const voiceMode = getLegacyOsVoiceMode(user.user_metadata as Record<string, unknown> | undefined);
  const clientName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  const voiceInstruction = buildLegacyOsVoiceInstruction(voiceMode, clientName);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Legacy OS model execution is not configured." }, { status: 503 });
  }

  const [memories, continuity] = await Promise.all([
    listRecallMemories(undefined, user.id, message),
    getContinuityEngineState(),
  ]);

  const context = buildContext(memories.length ? memories : await listRecallMemories(undefined, user.id), continuity);
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.LEGACY_OS_MODEL || "gpt-5-mini";

  const response = await client.responses.create({
    model,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text: `You are Legacy OS, the practical continuity intelligence behind Legacy Architect RVA. ${voiceInstruction}\n\nYour job is to help the client turn scattered knowledge into clear, usable continuity. Prefer plain language and concrete next steps. Do not invent facts, accounts, documents, people, dates, or legal conclusions. Treat Recall memories as user-provided context, not automatically verified truth. When evidence or provenance is incomplete, say so. The Life Manual organizes information; it does not replace legal, financial, medical, or other licensed professional advice.\n\nCurrent Legacy OS context:\n${context}`,
          },
        ],
      },
      {
        role: "user",
        content: [{ type: "input_text", text: message }],
      },
    ],
  });

  return NextResponse.json({
    agent: "LegacyOS",
    workspace,
    message,
    voiceMode,
    response: response.output_text,
    readiness: continuity.readiness,
  });
}
