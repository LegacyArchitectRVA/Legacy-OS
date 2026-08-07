import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json({
    success: true,
    file: body.file ?? null,
    status: "queued",
    pipeline: ["extract", "chunk", "embed", "index"]
  });
}
