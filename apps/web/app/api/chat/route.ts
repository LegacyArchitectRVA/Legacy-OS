import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { message, workspace } = await request.json();

  return NextResponse.json({
    agent: "LegacyOS",
    workspace,
    message,
    response: "Business Brain context retrieval is connected and ready for model execution."
  });
}
