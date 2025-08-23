export async function GET() {
  return Response.json({ ok: true, service: "nordlead-console", ts: new Date().toISOString() });
}