export async function GET() {
  return Response.json({
    status: "ok",
    name: "art-next-demo",
    timestamp: new Date().toISOString(),
  });
}
