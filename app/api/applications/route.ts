import { NextResponse } from "next/server";
import { createApplication, getApplicationSummary, listApplicationsPage } from "@/lib/applications";
import { STATUSES, SOURCES, type ApplicationSort } from "@/lib/types";

export const dynamic = "force-dynamic";

const SORTS = new Set<ApplicationSort>(["updated", "applied", "followUp", "company"]);

function integerParam(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) ? Math.min(Math.max(parsed, min), max) : fallback;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = integerParam(url.searchParams.get("page"), 1, 1, 1000000);
    const pageSize = integerParam(url.searchParams.get("pageSize"), 10, 1, 50);
    const status = url.searchParams.get("status") || "Active";
    const source = url.searchParams.get("source") || "";
    const sortValue = url.searchParams.get("sort") || "updated";
    const sort = SORTS.has(sortValue as ApplicationSort) ? sortValue as ApplicationSort : "updated";
    if (status !== "All" && status !== "Active" && !(STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
    }
    if (source && !(SOURCES as readonly string[]).includes(source)) {
      return NextResponse.json({ error: "Invalid source filter" }, { status: 400 });
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
      getApplicationSummary(),
    ]);
    return NextResponse.json({
      items,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
      summary,
    });
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
