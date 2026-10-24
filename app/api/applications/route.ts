import { NextResponse } from "next/server";
import { createApplication, listApplications } from "@/lib/applications";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(listApplications());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json(createApplication(body), { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
