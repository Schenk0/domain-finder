"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { cx } from "../types";

const PREFERRED_TLDS = ["com", "ai", "app", "dev", "io", "co", "xyz", "net", "org"];

export function DomainAdder({
  validTlds,
  existingDomains,
  onAdd,
}: {
  validTlds: Set<string>;
  existingDomains: Set<string>;
  onAdd: (domains: Array<{ sld: string; tld: string }>) => void;
}) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = value.trim().toLowerCase().replace(/[^a-z0-9.-]/g, "");
  const hasDot = trimmed.includes(".");
  const parsed = hasDot ? parseDomain(trimmed) : null;
  const baseName = hasDot ? null : trimmed;

  const isValidTld = parsed ? validTlds.has(parsed.tld) : false;
  const isNewDomain = parsed ? !existingDomains.has(`${parsed.sld}.${parsed.tld}`) : false;
  const canSubmitExact = parsed && isValidTld && isNewDomain;

  const suggestedTlds = baseName
    ? PREFERRED_TLDS.filter(
        (tld) => validTlds.has(tld) && !existingDomains.has(`${baseName}.${tld}`)
      )
    : [];

  function parseDomain(input: string) {
    const lastDot = input.lastIndexOf(".");
    if (lastDot < 1) return null;
    const sld = input.slice(0, lastDot);
    const tld = input.slice(lastDot + 1);
    if (!sld || !tld || !/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(sld)) return null;
    if (!/^[a-z]{2,}$/.test(tld)) return null;
    return { sld, tld };
  }

  function handleAdd(sld: string, tld: string) {
    onAdd([{ sld, tld }]);
    setValue("");
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleAddAll() {
    if (!baseName || suggestedTlds.length === 0) return;
    onAdd(suggestedTlds.map((tld) => ({ sld: baseName, tld })));
    setValue("");
    setOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canSubmitExact) {
      handleAdd(parsed.sld, parsed.tld);
    } else if (baseName && suggestedTlds.length > 0) {
      handleAdd(baseName, suggestedTlds[0]);
    }
  }

  function handleBlur(e: React.FocusEvent) {
    if (containerRef.current?.contains(e.relatedTarget as Node)) return;
    setOpen(false);
  }

  const invalidTldMessage =
    parsed && !isValidTld
      ? `.${parsed.tld} is not available on Porkbun.`
      : parsed && !isNewDomain
        ? `${parsed.sld}.${parsed.tld} is already in the list.`
        : null;

  return (
    <div ref={containerRef} className="relative" onBlur={handleBlur}>
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
        <div
          className={cx(
            "flex h-[34px] min-w-[180px] max-w-[250px] flex-1 items-center gap-2 rounded-md border border-border bg-white px-2.5 transition-colors duration-150 max-[860px]:max-w-none",
            open && "border-cobalt ring-[3px] ring-cobalt/15"
          )}
        >
          <Plus
            className="shrink-0 text-ink-secondary"
            size={14}
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            className="h-8 w-full min-w-0 border-0 bg-transparent text-[0.82rem] text-ink outline-none placeholder:text-ink-secondary"
            aria-label="Add a domain or variation"
            placeholder="Add domain…"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (!open && e.target.value.trim()) setOpen(true);
            }}
            onFocus={() => {
              if (trimmed) setOpen(true);
            }}
          />
        </div>
      </form>

      {open && trimmed.length >= 2 && (
        <div className="absolute left-0 top-full z-20 mt-1 w-[320px] overflow-hidden rounded-md border border-border bg-white shadow-[0_2px_8px_oklch(0_0_0/0.06)]">
          {canSubmitExact && (
            <button
              type="button"
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[0.82rem] transition-colors duration-150 hover:bg-surface"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleAdd(parsed.sld, parsed.tld)}
            >
              <Plus size={14} className="shrink-0 text-vermillion" aria-hidden="true" />
              <span className="font-bold text-ink">
                {parsed.sld}
                <span className="text-ink-secondary">.</span>
                <span className="text-available">{parsed.tld}</span>
              </span>
              <span className="ml-auto text-[0.74rem] text-ink-secondary">
                Add to list
              </span>
            </button>
          )}

          {invalidTldMessage && (
            <p className="px-3 py-2.5 text-[0.8rem] text-taken">
              {invalidTldMessage}
            </p>
          )}

          {baseName && suggestedTlds.length > 0 && (
            <>
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.02em] text-ink-secondary">
                  Variations
                </span>
                <button
                  type="button"
                  className="text-[0.72rem] font-bold text-cobalt transition-colors duration-150 hover:text-vermillion"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleAddAll}
                >
                  Add all
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 p-2.5">
                {suggestedTlds.map((tld) => (
                  <button
                    key={tld}
                    type="button"
                    className="rounded-[3px] bg-surface px-2.5 py-[4px] text-[0.78rem] font-bold text-ink transition-colors duration-150 hover:bg-cobalt/10 hover:text-cobalt"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleAdd(baseName, tld)}
                  >
                    {baseName}
                    <span className="text-ink-secondary">.</span>
                    <span className="text-available">{tld}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {!canSubmitExact && !invalidTldMessage && (!baseName || suggestedTlds.length === 0) && (
            <p className="px-3 py-2.5 text-[0.8rem] text-ink-secondary">
              Type a name or full domain like myapp.xyz
            </p>
          )}
        </div>
      )}
    </div>
  );
}
