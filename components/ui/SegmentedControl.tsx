import { cn } from "@/lib/cn";

export type SegmentedOption = { value: string; label: string };

type Props = {
  value: string;
  options: SegmentedOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
};

/** Segmented pill selector (e.g. Remote / Hybrid / On-site). Clicking the active pill clears it. */
export function SegmentedControl({ value, options, onChange, ariaLabel }: Props) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? "" : o.value)}
            className={cn(
              "flex-1 cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors sm:flex-none",
              active
                ? "border-fg bg-fg text-bg"
                : "border-line bg-surface text-muted hover:bg-subtle hover:text-fg",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
