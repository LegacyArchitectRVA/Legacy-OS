import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json({
    agent: 'Elara',
    status: 'ready',
    workspace: body.workspace ?? null,
    response: 'Elara is ready to assist with continuity planning, knowledge organization, and readiness guidance.'
  });
}
