import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { name, type, content } = await request.json();

  return NextResponse.json({
    document: {
      name,
      type,
      status: "queued",
      extracted: Boolean(content)
    }
  });
}
