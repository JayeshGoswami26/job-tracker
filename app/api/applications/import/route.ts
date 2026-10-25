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
  try {
    const body = await req.json();
    const items = extractItems(body);
    const result = await importApplications(items);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not import applications" },
      { status: 400 },
    );
  }
}
