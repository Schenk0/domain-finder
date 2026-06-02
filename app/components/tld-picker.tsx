"use client";

import { useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { Plus, Search, X } from "lucide-react";
import { cx } from "../types";

export function TldPicker({
  allTlds,
  resultTlds,
  selectedTlds,
  onToggle,
  onClear,
  onAddTld,
}: {
  allTlds: string[];
  resultTlds: string[];
  selectedTlds: Set<string>;
  onToggle: (tld: string) => void;
  onClear: () => void;
  onAddTld: (tld: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resultTldSet = useMemo(() => new Set(resultTlds), [resultTlds]);

  const q = query.trim().toLowerCase().replace(/^\./, "");

  const fuse = useMemo(
    () =>
      new Fuse(allTlds, {
        threshold: 0.4,
        distance: 50,
        includeScore: true,
      }),
    [allTlds]
  );

  const suggestions = useMemo(() => {
    if (!q) return allTlds.slice(0, 80);
    return fuse.search(q).map((r) => r.item);
  }, [fuse, allTlds, q]);

  const selectedArr = allTlds.filter((tld) => selectedTlds.has(tld));

  function handleBlur(e: React.FocusEvent) {
    if (containerRef.current?.contains(e.relatedTarget as Node)) return;
    setOpen(false);
  }

  function handleTldClick(tld: string) {
    const inResults = resultTldSet.has(tld);
    if (inResults) {
      onToggle(tld);
    } else {
      onAddTld(tld);
    }
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <div
      ref={containerRef}
      className="relative flex flex-1 items-center"
      onBlur={handleBlur}
    >
      <div
        className={cx(
          "flex min-h-[34px] w-full flex-wrap items-center gap-1.5 rounded-md border border-border bg-white px-2.5 transition-colors duration-150",
          open && "border-cobalt ring-[3px] ring-cobalt/15"
        )}
      >
        {selectedArr.map((tld) => (
          <button
            key={tld}
            type="button"
            className="inline-flex items-center gap-1 rounded-[3px] bg-surface px-1.5 py-[2px] text-[0.72rem] font-bold text-ink transition-colors duration-150 hover:bg-taken-bg hover:text-taken"
            onClick={() => onToggle(tld)}
            aria-label={`Remove .${tld} filter`}
          >
            .{tld.toUpperCase()}
            <X size={10} aria-hidden="true" />
          </button>
        ))}

        <div className="flex min-w-[80px] flex-1 items-center gap-1.5">
          <Search
            className="shrink-0 text-ink-secondary"
            size={12}
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            className="h-7 w-full min-w-0 border-0 bg-transparent text-[0.8rem] text-ink outline-none placeholder:text-ink-secondary"
            aria-label="Search TLDs"
            placeholder={selectedArr.length > 0 ? "Add TLD…" : "Filter by TLD…"}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
        </div>

        {selectedArr.length > 0 && (
          <button
            type="button"
            className="ml-auto shrink-0 rounded-[3px] p-0.5 text-ink-secondary transition-colors duration-150 hover:text-taken"
            onClick={() => {
              onClear();
              setQuery("");
            }}
            aria-label="Clear all TLD filters"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute left-0 top-full z-20 mt-1 max-h-[240px] w-full overflow-y-auto rounded-md border border-border bg-white shadow-[0_2px_8px_oklch(0_0_0/0.06)]">
          {q === "" && (
            <p className="border-b border-border px-2.5 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.02em] text-ink-secondary">
              Type to search {allTlds.length} TLDs
            </p>
          )}
          <div className="flex flex-wrap gap-1 p-2">
            {suggestions.map((tld) => {
              const active = selectedTlds.has(tld);
              const inResults = resultTldSet.has(tld);
              return (
                <button
                  key={tld}
                  type="button"
                  className={cx(
                    "inline-flex items-center gap-1 rounded-[3px] px-2 py-[3px] text-[0.74rem] font-bold transition-colors duration-150",
                    active
                      ? "bg-cobalt/10 text-cobalt"
                      : inResults
                        ? "bg-surface text-ink hover:bg-cobalt/5"
                        : "bg-transparent text-ink-secondary hover:bg-vermillion/5 hover:text-vermillion"
                  )}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleTldClick(tld)}
                  title={inResults ? `Filter by .${tld}` : `Add .${tld} domains to list`}
                >
                  {!inResults && !active && (
                    <Plus size={11} className="shrink-0" aria-hidden="true" />
                  )}
                  .{tld}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
