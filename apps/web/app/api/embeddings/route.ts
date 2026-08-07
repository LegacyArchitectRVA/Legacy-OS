import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { chunks } = await request.json();

  return NextResponse.json({
    status: "embedding pipeline ready",
    chunksReceived: chunks?.length ?? 0,
    vectorStorage: "pending provider connection"
  });
}
