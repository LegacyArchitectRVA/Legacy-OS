import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { query } = await request.json();

  return NextResponse.json({
    query,
    results: [],
    status: "vector search ready"
  });
}
