import { NextResponse } from "next/server";
import { deleteApplication, updateApplication } from "@/lib/applications";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const { id } = await params;
  try {
    const app = updateApplication(id, await req.json());
    if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(app);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return deleteApplication(id)
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}
