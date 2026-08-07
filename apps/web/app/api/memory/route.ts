import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const memory = await request.json();

  return NextResponse.json({
    stored: true,
    memory
  });
}
