import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { query, context } = await request.json()

  return NextResponse.json({
    query,
    context,
    response: 'LegacyOS context engine ready for model connection.'
  })
}
