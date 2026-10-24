import type { RefObject } from "react";
import { cn } from "@/lib/cn";
import { SOURCES } from "@/lib/types";
import type { ApplicationSort } from "@/lib/types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Search, Download } from "./ui/icons";
import { Select, type SelectOption } from "./ui/Select";

export const SORTS: SelectOption[] = [
  { value: "updated", label: "Recently updated" },
  { value: "applied", label: "Newest applied" },
  { value: "followUp", label: "Follow-up date" },
  { value: "company", label: "Company A–Z" },
];
export type SortKey = ApplicationSort;

const SOURCE_OPTIONS: SelectOption[] = [{ value: "", label: "All sources" }, ...SOURCES.map((s) => ({ value: s, label: s }))];

type Props = {
  query: string;
  onQuery: (v: string) => void;
  source: string;
  onSource: (v: string) => void;
  sort: SortKey;
  onSort: (v: SortKey) => void;
  onExport: () => void;
  searchRef: RefObject<HTMLInputElement | null>;
};

export function TableToolbar({ query, onQuery, source, onSource, sort, onSort, onExport, searchRef }: Props) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2.5">
      <div className="relative min-w-0 flex-[1_1_260px]">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted" />
        <Input
          ref={searchRef}
          type="search"
          placeholder="Search company, role, contact or notes"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          className="pl-8.5"
          aria-label="Search applications"
        />
      </div>
      <Select
        value={source}
        options={SOURCE_OPTIONS}
        onChange={onSource}
        ariaLabel="Filter by source"
        className={cn("border border-line bg-surface px-3 py-2 hover:bg-subtle")}
      />
      <Select
        value={sort}
        options={SORTS}
        onChange={(v) => onSort(v as SortKey)}
        ariaLabel="Sort applications"
        className={cn("border border-line bg-surface px-3 py-2 hover:bg-subtle")}
      />
      <Button onClick={onExport} title="Download all applications as CSV">
        <Download className="size-3.5" />
        Export CSV
      </Button>
    </div>
  );
}
