"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ApplicationForm } from "./ApplicationForm";
import { ApplicationsTable, TableEmptyState } from "./ApplicationsTable";
import { FollowUpQueue } from "./FollowUpQueue";
import { StatsBar } from "./StatsBar";
import { StatusTabs, type TabItem } from "./StatusTabs";
import { ThemeToggle } from "./ThemeToggle";
import { TableToolbar, type SortKey } from "./TableToolbar";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { Plus } from "./ui/icons";
import { useApplications } from "@/hooks/useApplications";
import { useHotkeys } from "@/hooks/useHotkeys";
import { useToast } from "@/hooks/useToast";
import { downloadCSV, toCSV } from "@/lib/csv";
import { cn } from "@/lib/cn";
import { FOLLOW_DAYS, addDays, today } from "@/lib/date";
import { STATUSES, type App, type Draft, type Status } from "@/lib/types";

const CSV_HEADERS = [
  "Company", "Role", "Source", "Work mode", "Salary", "Location", "Date applied",
  "Status", "Follow-up date", "Contact", "Link", "Notes", "Rejection reason", "Created", "Updated",
];

type SheetState = { editing: App | null; presetStatus?: Status; focusReason?: boolean } | null;

export default function Tracker() {
  const toast = useToast();
  const [statusFilter, setStatusFilter] = useState("Active");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");
  const [page, setPage] = useState(1);
  const [sheet, setSheet] = useState<SheetState>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const pageSize = 10;

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  const { apps, summary, pagination, loaded, loading, loadError, create, update, remove } = useApplications({
    query: debouncedQuery,
    status: statusFilter,
    source: sourceFilter,
    sort,
    page,
    pageSize,
  });

  useHotkeys(
    {
      n: () => setSheet({ editing: null }),
      "/": () => searchRef.current?.focus(),
    },
    sheet === null,
  );

  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();
    counts.set("Active", summary.activeTab);
    counts.set("All", summary.total);
    for (const status of STATUSES) counts.set(status, summary.byStatus[status]);
    return counts;
  }, [summary]);

  const tabs: readonly TabItem[] = useMemo(() => {
    return ["Active", "All", ...STATUSES].map((key) => ({
      id: key,
      label: key,
      count: statusCounts.get(key) ?? 0,
    }));
  }, [statusCounts]);

  const list = apps;

  function resetPage() {
    setPage(1);
  }

  function exportCsv() {
    const rows = apps.map((a) => [
      a.company, a.role, a.source, a.workMode, a.salary, a.location, a.applied,
      a.status, a.followUp, a.contact, a.link, a.notes, a.rejectReason,
      new Date(a.createdAt).toISOString(), new Date(a.updatedAt).toISOString(),
    ]);
    downloadCSV(`applications-${today()}.csv`, toCSV(CSV_HEADERS, rows));
    toast(`Exported ${apps.length} application${apps.length === 1 ? "" : "s"} on this page`);
  }

  async function handleSave(data: Draft): Promise<boolean> {
    const editing = sheet?.editing ?? null;
    if (editing) {
      const ok = await update(editing.id, data);
      if (ok) {
        toast("Saved");
        setSheet(null);
      }
      return ok;
    }
    const created = await create(data);
    if (created) {
      toast("Added " + created.company);
      setSheet(null);
    }
    return created !== null;
  }

  async function handleDelete(a: App) {
    if (await remove(a.id)) setSheet(null);
  }

  function handleStatusChange(a: App, status: Status) {
    if (status === a.status) return;
    if (status === "Rejected") {
      // Needs a mandatory reason — route through the form instead of a blind patch.
      setSheet({ editing: a, presetStatus: "Rejected", focusReason: true });
      return;
    }
    if (status === "Closed") {
      void update(a.id, { status, followUp: "" }, "Closed");
      return;
    }
    void update(a.id, { status });
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast("Copied " + text);
    } catch {
      toast(text);
    }
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-fg">Application Tracker</h1>
          <p className="mt-0.5 text-xs text-muted">Companies you have applied to, and the follow-ups due.</p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="primary" onClick={() => setSheet({ editing: null })}>
            <Plus className="size-3.5" />
            Add application
          </Button>
        </div>
      </header>

      {loadError && <div className="rounded-md border border-line bg-subtle px-3.5 py-2 text-xs text-rose-400">{loadError}</div>}

      <StatsBar
        dueCount={summary.due.length}
        waitingCount={summary.active}
        interviewCount={statusCounts.get("Interview") ?? 0}
        totalCount={summary.total}
      />

      {summary.due.length > 0 && (
        <FollowUpQueue
          items={summary.due}
          onFollowUp={(a) =>
            void update(
              a.id,
              { status: "Followed up", followUp: addDays(today(), FOLLOW_DAYS) },
              `Marked followed up. Next check in ${FOLLOW_DAYS} days.`,
            )
          }
          onClose={(a) => void update(a.id, { status: "Closed", followUp: "" }, "Closed with no response")}
          onCopy={copy}
          onOpen={(a) => setSheet({ editing: a })}
        />
      )}

      <section aria-label="All applications">
        <h2 className="mb-2.5 flex items-center gap-2 text-[11px] font-semibold tracking-wider text-muted uppercase select-none">
          All applications <span className="font-mono text-xs tracking-normal text-fg">{list.length}</span>
        </h2>

        <TableToolbar
          query={query}
          onQuery={(value) => {
            setQuery(value);
            resetPage();
          }}
          source={sourceFilter}
          onSource={(value) => {
            setSourceFilter(value);
            resetPage();
          }}
          sort={sort}
          onSort={(value) => {
            setSort(value);
            resetPage();
          }}
          onExport={exportCsv}
          searchRef={searchRef}
        />

        <StatusTabs
          tabs={tabs}
          activeId={statusFilter}
          onChange={(value) => {
            setStatusFilter(value);
            resetPage();
          }}
          className="mb-3"
        />

        {!loaded && <TableEmptyState loaded={false} total={summary.total} />}
        {loaded && summary.total > 0 && list.length === 0 && (
          <div className="rounded-lg border border-line bg-surface/40 p-8 text-center text-xs text-muted">
            No applications match the current filters.
          </div>
        )}
        {list.length > 0 && (
          <div className={cn("transition-opacity duration-150", loading && "opacity-60")} aria-busy={loading}>
            <ApplicationsTable apps={list} onOpen={(a) => setSheet({ editing: a })} onStatusChange={handleStatusChange} />
          </div>
        )}
        {loaded && pagination.totalPages > 1 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
            <span>
              Showing {(pagination.page - 1) * pagination.pageSize + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="default" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                Previous
              </Button>
              <span className="font-mono tabular-nums">{pagination.page} / {pagination.totalPages}</span>
              <Button variant="default" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </section>

      <Modal
        open={sheet !== null}
        onClose={() => setSheet(null)}
        title={sheet?.editing ? "Edit application" : "Add application"}
      >
        {sheet && (
          <ApplicationForm
            key={sheet.editing?.id ?? "new"}
            editing={sheet.editing}
            presetStatus={sheet.presetStatus}
            focusReason={sheet.focusReason}
            existing={apps}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={() => setSheet(null)}
          />
        )}
      </Modal>
    </div>
  );
}
