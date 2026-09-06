import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../lib/supabase/server";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  const { name, type, content } = await request.json();
  return NextResponse.json({
    document: { name, type, status: "queued", extracted: Boolean(content), userId: user.id }
  });
}
