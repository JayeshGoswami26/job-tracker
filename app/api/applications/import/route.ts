import { requireOwner, PRIVATE_HEADERS } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { importApplications } from "@/lib/applications";

export const dynamic = "force-dynamic";

function extractItems(body: unknown): unknown[] {
  if (Array.isArray(body)) return body;
  if (typeof body !== "object" || body === null) return [body];
  const record = body as Record<string, unknown>;
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(record.applications)) return record.applications;
  return [body];
}

export async function POST(req: Request) {
  const denied = await requireOwner(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const items = extractItems(body);
    const result = await importApplications(items);
    return privateJson(result, { status: 201 });
  } catch (error) {
    return privateJson(
      { error: error instanceof Error ? error.message : "Could not import applications" },
      { status: 400 },
    );
  }
}

const privateJson: typeof NextResponse.json = (body, init) => {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", PRIVATE_HEADERS["Cache-Control"]);
  return response;
};
