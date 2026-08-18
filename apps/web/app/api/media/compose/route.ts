import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as {
    sourceVideoUri?: string;
    voiceAudioUri?: string;
    authorized?: boolean;
  } | null;

  if (!body?.authorized) {
    return NextResponse.json({ status: "denied", note: "Authorization is required." }, { status: 403 });
  }
  if (!body.sourceVideoUri || !body.voiceAudioUri) {
    return NextResponse.json({ status: "invalid-input", note: "Source video and voice audio are required." }, { status: 400 });
  }

  return NextResponse.json({
    status: "needs-encoder",
    sourceVideoUri: body.sourceVideoUri,
    voiceAudioUri: body.voiceAudioUri,
    note: "Media composition is queued for the configured encoder worker.",
  }, { status: 202 });
}
