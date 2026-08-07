import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { question, context } = await request.json();

  return NextResponse.json({
    agent: "Business Brain",
    question,
    context,
    response: "Knowledge retrieval layer ready for model connection."
  });
}
