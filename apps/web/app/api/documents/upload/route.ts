export async function POST(request: Request) {
  const body = await request.json()

  return Response.json({
    success: true,
    document: {
      name: body.name,
      status: 'queued',
      pipeline: ['extract', 'chunk', 'embed', 'index']
    }
  })
}
