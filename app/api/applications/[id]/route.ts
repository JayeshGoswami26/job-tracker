import { requireOwner, PRIVATE_HEADERS } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { deleteApplication, updateApplication } from "@/lib/applications";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const denied = await requireOwner(req);
  if (denied) return denied;
  const { id } = await params;
  try {
    const body = await req.json();
    const app = await updateApplication(id, body);
    if (!app) return privateJson({ error: "Not found" }, { status: 404 });
    return privateJson(app);
  } catch (e) {
    return privateJson({ error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  const denied = await requireOwner(req);
  if (denied) return denied;
  const { id } = await params;
  try {
    const ok = await deleteApplication(id);
    return ok
      ? new NextResponse(null, { status: 204, headers: PRIVATE_HEADERS })
      : privateJson({ error: "Not found" }, { status: 404 });
  } catch (e) {
    return privateJson({ error: (e as Error).message }, { status: 500 });
  }
}

const privateJson: typeof NextResponse.json = (body, init) => {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", PRIVATE_HEADERS["Cache-Control"]);
  return response;
};
