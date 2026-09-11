import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../lib/supabase/server";
import { buildLegacyOsVoiceInstruction, getLegacyOsVoiceMode } from "../../../lib/legacyos-voice";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  const { message, workspace } = await request.json();
  const voiceMode = getLegacyOsVoiceMode(user.user_metadata as Record<string, unknown> | undefined);
  const clientName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null;
  const voiceInstruction = buildLegacyOsVoiceInstruction(voiceMode, clientName);

  return NextResponse.json({
    agent: "LegacyOS",
    workspace,
    message,
    voiceMode,
    voiceInstruction,
    response: "Business Brain context retrieval is connected and ready for model execution.",
  });
}
