import { NextResponse } from "next/server";

export async function POST(request: Request) {
 const { workspace } = await request.json();

 return NextResponse.json({
  report: "LegacyOS weekly intelligence report",
  workspace,
  sections: ["changes", "risks", "recommendations"]
 });
}
