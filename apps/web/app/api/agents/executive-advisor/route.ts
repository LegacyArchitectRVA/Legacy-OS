import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { question, businessContext } = await request.json();

  return NextResponse.json({
    agent: "Executive Advisor",
    question,
    analysis: "Advisor layer initialized.",
    contextUsed: Boolean(businessContext)
  });
}
