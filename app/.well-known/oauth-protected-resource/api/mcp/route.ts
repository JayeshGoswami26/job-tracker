import { resourceMetadata } from "@/lib/mcp/config";
export const dynamic = "force-dynamic";
export function GET() {
  try { return Response.json(resourceMetadata(), { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ error: "Authentication is not configured" }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
