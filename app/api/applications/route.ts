import { requireOwner, PRIVATE_HEADERS } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { createApplication, getApplicationSummary, listApplicationsPage } from "@/lib/applications";
import { STATUSES, SOURCES, type ApplicationSort } from "@/lib/types";

export const dynamic = "force-dynamic";

const SORTS = new Set<ApplicationSort>(["updated", "applied", "followUp", "company"]);

function integerParam(value: string | null, fallback: number, min: number, max: number) {
  if (value === null || value.trim() === "") return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.min(Math.max(parsed, min), max) : fallback;
}

export async function GET(req: Request) {
  const denied = await requireOwner(req);
  if (denied) return denied;
  try {
    const url = new URL(req.url);
    const page = integerParam(url.searchParams.get("page"), 1, 1, 1000000);
    const pageSize = integerParam(url.searchParams.get("pageSize"), 10, 1, 50);
    const status = url.searchParams.get("status") || "Active";
    const source = url.searchParams.get("source") || "";
    const sortValue = url.searchParams.get("sort") || "updated";
    const sort = SORTS.has(sortValue as ApplicationSort) ? sortValue as ApplicationSort : "updated";
    if (status !== "All" && status !== "Active" && !(STATUSES as readonly string[]).includes(status)) {
      return privateJson({ error: "Invalid status filter" }, { status: 400 });
    }
    if (source && !(SOURCES as readonly string[]).includes(source)) {
      return privateJson({ error: "Invalid source filter" }, { status: 400 });
    }
    const [{ items, total }, summary] = await Promise.all([
      listApplicationsPage({
        page,
        pageSize,
        query: url.searchParams.get("query") || "",
        status,
        source,
        sort,
      }),
      url.searchParams.get("summary") === "false" ? undefined : getApplicationSummary(),
    ]);
    return privateJson({
      items,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
      summary,
    });
  } catch (e) {
    return privateJson({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await requireOwner(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const created = await createApplication(body);
    return privateJson(created, { status: 201 });
  } catch (e) {
    return privateJson({ error: (e as Error).message }, { status: 400 });
  }
}

const privateJson: typeof NextResponse.json = (body, init) => {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", PRIVATE_HEADERS["Cache-Control"]);
  return response;
};
