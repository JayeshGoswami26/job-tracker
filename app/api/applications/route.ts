import { NextResponse } from "next/server";
import { createApplication, listApplications } from "@/lib/applications";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await listApplications();
    return NextResponse.json(list);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createApplication(body);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
