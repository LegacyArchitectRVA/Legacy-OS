import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '../../../lib/supabase/server';

export async function POST(request: Request) {
  if (!await getAuthenticatedUser()) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const body = await request.json();

  return NextResponse.json({
    agent: 'Elara',
    status: 'ready',
    workspace: body.workspace ?? null,
    response: 'Elara is ready to assist with continuity planning, knowledge organization, and readiness guidance.'
  });
}
