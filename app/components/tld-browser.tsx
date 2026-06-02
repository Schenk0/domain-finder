"use client";

import { useMemo, useRef, useState } from "react";
import Fuse from "fuse.js";
import { Check, Plus, Search } from "lucide-react";
import { cx } from "../types";

export function TldBrowser({
  allTlds,
  tldPricing,
  brand,
  addedTlds,
  onAdd,
}: {
  allTlds: string[];
  tldPricing: Record<string, { registration?: string; renewal?: string }>;
  brand: string | null;
  addedTlds: Set<string>;
  onAdd: (tld: string) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

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

  const filtered = useMemo(() => {
    if (!q) return allTlds;
    return fuse.search(q).map((r) => r.item);
  }, [fuse, allTlds, q]);

  return (
    <div className="border-t border-border bg-surface">
      <div className="flex items-center gap-3 px-5 py-3">
        <div className="flex h-[34px] max-w-[280px] flex-1 items-center gap-2 rounded-md border border-border bg-white px-3 transition-colors duration-150 focus-within:border-cobalt focus-within:ring-[3px] focus-within:ring-cobalt/15">
          <Search
            className="shrink-0 text-ink-secondary"
            size={14}
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            className="h-8 w-full min-w-0 border-0 bg-transparent text-[0.82rem] text-ink outline-none placeholder:text-ink-secondary"
            aria-label="Search TLDs"
            placeholder="Search TLDs…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <p className="text-[0.78rem] text-ink-secondary">
          {filtered.length === allTlds.length
            ? `${allTlds.length} TLDs available`
            : `${filtered.length} of ${allTlds.length} TLDs`}
        </p>
      </div>

      <div className="max-h-[320px] overflow-y-auto px-5 pb-4">
        {!brand && (
          <p className="py-3 text-[0.82rem] text-ink-secondary">
            Enter a project name first, then add TLDs here.
          </p>
        )}

        {brand && filtered.length === 0 && (
          <p className="py-3 text-[0.82rem] text-ink-secondary">
            No TLDs match &ldquo;{q}&rdquo;.
          </p>
        )}

        {brand && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
            {filtered.map((tld) => {
              const price = tldPricing[tld];
              const alreadyAdded = addedTlds.has(tld);

              return (
                <div
                  key={tld}
                  className={cx(
                    "flex items-center gap-3 rounded-md px-3 py-2 transition-colors duration-150",
                    alreadyAdded ? "bg-white" : "bg-white hover:bg-cobalt/[0.03]"
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.86rem] font-bold text-ink [overflow-wrap:anywhere]">
                      {brand}
                      <span className="text-ink-secondary">.</span>
                      <span className="text-available">{tld}</span>
                    </p>
                    {price?.renewal && (
                      <p className="text-[0.72rem] text-ink-secondary">
                        ${price.renewal}/yr
                      </p>
                    )}
                  </div>

                  {alreadyAdded ? (
                    <span className="inline-flex items-center gap-1 text-[0.74rem] font-bold text-available">
                      <Check size={14} aria-hidden="true" />
                      Added
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2.5 py-1 text-[0.74rem] font-bold text-ink transition-colors duration-150 hover:border-vermillion hover:text-vermillion"
                      onClick={() => onAdd(tld)}
                    >
                      <Plus size={12} aria-hidden="true" />
                      Add
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
