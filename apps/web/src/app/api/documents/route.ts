export async function POST(request: Request) {
  const body = await request.json();

  return Response.json({
    status: "received",
    document: body,
    nextStep: "process_and_index"
  });
}
