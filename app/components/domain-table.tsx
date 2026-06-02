"use client";

import { Fragment, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Loader2,
  Star,
} from "lucide-react";
import { StatusBadge } from "./status-badge";
import { DomainParts } from "./domain-parts";
import {
  cx,
  formatPrice,
  groupResults,
  isDomainVariantCollapsedKind,
  clusterKindResults,
  emptyGroupMessage,
  KIND_LABEL,
  KIND_DESCRIPTION,
  type CandidateKind,
  type Result,
} from "../types";

const TH =
  "border-b border-border bg-surface px-4 py-3 text-left text-[0.76rem] font-bold uppercase tracking-[0.02em] text-ink-secondary";
const TD = "border-b border-border px-4 py-3 align-middle text-[0.92rem] text-ink-secondary";
const STAR_COL = "w-11 pr-0 text-center align-middle";

function isPromoPrice(result: Result) {
  const reg = parseFloat(result.registrationPrice ?? result.regularPrice ?? "");
  const renew = parseFloat(result.renewalPrice ?? "");
  return !isNaN(reg) && !isNaN(renew) && reg < renew;
}

export function DomainTable({
  checkingDomains,
  dnsChecking = false,
  grouped = true,
  hasCredentials,
  onCheck,
  onToggleStar,
  results,
  starredResults,
  starredDomains,
}: {
  checkingDomains: Set<string>;
  dnsChecking?: boolean;
  grouped?: boolean;
  hasCredentials: boolean;
  onCheck: (result: Result) => void;
  onToggleStar: (domain: string) => void;
  results: Result[];
  starredResults?: Result[];
  starredDomains: Set<string>;
}) {
  if (results.length === 0) {
    return (
      <p className="p-5 text-[0.92rem] text-ink-secondary">
        No domains match this filter.
      </p>
    );
  }

  const groups = groupResults(results);
  const hasStarred = starredResults && starredResults.length > 0;

  return (
    <div className="relative overflow-x-auto overflow-y-visible max-[860px]:overflow-y-visible">
      <table className="w-full min-w-[980px] border-separate border-spacing-0">
        <thead className="sticky top-0 z-[7]">
          <tr>
            <th aria-label="Star" className={cx(TH, STAR_COL, "sticky top-0 z-[8]")} />
            <th className={cx(TH, "sticky top-0 z-[8]")}>Domain</th>
            <th className={cx(TH, "sticky top-0 z-[8]")}>Register</th>
            <th className={cx(TH, "sticky top-0 z-[8]")}>Renewal</th>
            <th className={cx(TH, "sticky top-0 z-[8]")}>Reason</th>
            <th className={cx(TH, "sticky top-0 z-[8]")}>Action</th>
          </tr>
        </thead>
        <tbody>
          {grouped && hasStarred && (
            <>
              <tr>
                <th
                  colSpan={6}
                  className="border-y border-border bg-[oklch(0.96_0.005_260)] px-4 py-3 text-left normal-case text-ink first:border-t-0"
                >
                  <div className="flex items-baseline gap-2.5 max-[580px]:flex-col max-[580px]:items-start max-[580px]:gap-1">
                    <strong className="text-[0.92rem] font-bold">
                      Starred
                    </strong>
                    <span className="text-[0.82rem] font-medium text-ink-secondary">
                      Your shortlisted domains.
                    </span>
                  </div>
                </th>
              </tr>
              <TableRows
                checkingDomains={checkingDomains}
                dnsChecking={dnsChecking}
                hasCredentials={hasCredentials}
                onCheck={onCheck}
                onToggleStar={onToggleStar}
                results={starredResults}
                starredDomains={starredDomains}
              />
            </>
          )}
          {grouped
            ? groups.map((group) => (
                <TableGroup
                  checkingDomains={checkingDomains}
                  dnsChecking={dnsChecking}
                  group={group}
                  hasCredentials={hasCredentials}
                  key={group.kind}
                  onCheck={onCheck}
                  onToggleStar={onToggleStar}
                  starredDomains={starredDomains}
                />
              ))
            : (
                <TableRows
                  checkingDomains={checkingDomains}
                  dnsChecking={dnsChecking}
                  hasCredentials={hasCredentials}
                  onCheck={onCheck}
                  onToggleStar={onToggleStar}
                  results={results}
                  starredDomains={starredDomains}
                />
              )}
        </tbody>
      </table>
    </div>
  );
}

function TableGroup({
  checkingDomains,
  dnsChecking,
  hasCredentials,
  onCheck,
  onToggleStar,
  starredDomains,
  group,
}: {
  checkingDomains: Set<string>;
  dnsChecking: boolean;
  group: { kind: CandidateKind; results: Result[] };
  hasCredentials: boolean;
  onCheck: (result: Result) => void;
  onToggleStar: (domain: string) => void;
  starredDomains: Set<string>;
}) {
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(
    new Set()
  );
  const clusters = useMemo(
    () => clusterKindResults(group.results, group.kind),
    [group.results, group.kind]
  );

  function handleToggleCluster(key: string) {
    setExpandedClusters((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <>
      <tr>
        <th
          colSpan={6}
          className="border-y border-border bg-[oklch(0.96_0.005_260)] px-4 py-3 text-left normal-case text-ink first:border-t-0"
        >
          <div className="flex items-baseline gap-2.5 max-[580px]:flex-col max-[580px]:items-start max-[580px]:gap-1">
            <strong className="text-[0.92rem] font-bold">
              {KIND_LABEL[group.kind]}
            </strong>
            <span className="text-[0.82rem] font-medium text-ink-secondary">
              {KIND_DESCRIPTION[group.kind]}
            </span>
          </div>
        </th>
      </tr>

      {group.results.length === 0 ? (
        <tr>
          <td
            colSpan={6}
            className="bg-surface px-4 pb-3.5 pl-[60px] pt-3 text-[0.86rem] italic text-ink-secondary"
          >
            {emptyGroupMessage(group.kind)}
          </td>
        </tr>
      ) : isDomainVariantCollapsedKind(group.kind) ? (
        clusters.map((cluster) => {
          const isExpanded = expandedClusters.has(cluster.key);
          const hasVariants = cluster.variants.length > 0;
          return (
            <Fragment key={cluster.key}>
              <TableRow
                checkingDomains={checkingDomains}
                dnsChecking={dnsChecking}
                expandControl={
                  hasVariants
                    ? {
                        expanded: isExpanded,
                        onToggle: () => handleToggleCluster(cluster.key),
                      }
                    : undefined
                }
                hasCredentials={hasCredentials}
                onCheck={onCheck}
                onToggleStar={onToggleStar}
                result={cluster.primary}
                starredDomains={starredDomains}
              />
              {isExpanded
                ? cluster.variants.map((v) => (
                    <TableRow
                      checkingDomains={checkingDomains}
                      dnsChecking={dnsChecking}
                      hasCredentials={hasCredentials}
                      key={v.candidate.domain}
                      onCheck={onCheck}
                      onToggleStar={onToggleStar}
                      result={v}
                      rowClassName="[&>td]:bg-surface hover:[&>td]:bg-[oklch(0.95_0_0)]"
                      starredDomains={starredDomains}
                    />
                  ))
                : null}
            </Fragment>
          );
        })
      ) : (
        <TableRows
          checkingDomains={checkingDomains}
          dnsChecking={dnsChecking}
          hasCredentials={hasCredentials}
          onCheck={onCheck}
          onToggleStar={onToggleStar}
          results={group.results}
          starredDomains={starredDomains}
        />
      )}
    </>
  );
}

function TableRows({
  checkingDomains,
  dnsChecking,
  hasCredentials,
  onCheck,
  onToggleStar,
  results,
  starredDomains,
}: {
  checkingDomains: Set<string>;
  dnsChecking: boolean;
  hasCredentials: boolean;
  onCheck: (result: Result) => void;
  onToggleStar: (domain: string) => void;
  results: Result[];
  starredDomains: Set<string>;
}) {
  return (
    <>
      {results.map((result) => (
        <TableRow
          checkingDomains={checkingDomains}
          dnsChecking={dnsChecking}
          hasCredentials={hasCredentials}
          key={result.candidate.domain}
          onCheck={onCheck}
          onToggleStar={onToggleStar}
          result={result}
          starredDomains={starredDomains}
        />
      ))}
    </>
  );
}

function TableRow({
  checkingDomains,
  dnsChecking,
  expandControl,
  hasCredentials,
  onCheck,
  onToggleStar,
  result,
  rowClassName,
  starredDomains,
}: {
  checkingDomains: Set<string>;
  dnsChecking: boolean;
  expandControl?: { expanded: boolean; onToggle: () => void };
  hasCredentials: boolean;
  onCheck: (result: Result) => void;
  onToggleStar: (domain: string) => void;
  result: Result;
  rowClassName?: string;
  starredDomains: Set<string>;
}) {
  const isStarred = starredDomains.has(result.candidate.domain);
  const canCheck =
    result.availability === "unchecked" || result.availability === "rate-limited" || result.availability === "error";
  const isDnsLoading = dnsChecking && result.availability === "unchecked";

  return (
    <tr
      className={cx(
        "transition-colors duration-150 hover:bg-surface",
        rowClassName
      ) || undefined}
    >
      <td className={cx(TD, STAR_COL)}>
        <button
          aria-label={`${isStarred ? "Unstar" : "Star"} ${result.candidate.domain}`}
          className={cx(
            "mx-auto inline-flex size-7 items-center justify-center rounded-full bg-transparent text-ink-secondary transition-colors duration-150 hover:bg-surface hover:text-ink",
            isStarred && "text-ink"
          )}
          onClick={() => onToggleStar(result.candidate.domain)}
          title={isStarred ? "Remove from shortlist" : "Add to shortlist"}
          type="button"
        >
          <Star
            className={isStarred ? "fill-current" : undefined}
            size={17}
            aria-hidden="true"
          />
        </button>
      </td>

      <td className={TD}>
        <div className="grid gap-[5px]">
          {expandControl ? (
            <button
              aria-expanded={expandControl.expanded}
              className="inline-flex w-fit items-center gap-[5px] border-0 bg-transparent p-0 text-left text-[0.98rem] font-bold text-ink transition-colors duration-150 hover:text-vermillion"
              onClick={expandControl.onToggle}
              type="button"
            >
              {expandControl.expanded ? (
                <ChevronDown className="text-ink-secondary" size={15} aria-hidden="true" />
              ) : (
                <ChevronRight className="text-ink-secondary" size={15} aria-hidden="true" />
              )}
              <span className="inline-flex items-baseline">
                <DomainParts result={result} />
              </span>
            </button>
          ) : (
            <strong className="text-[0.98rem] text-ink">
              <DomainParts result={result} />
            </strong>
          )}
          {result.premium ? (
            <span className="w-fit rounded-[3px] bg-caution-bg px-2 py-[2px] text-[0.72rem] font-bold text-caution">
              Premium
            </span>
          ) : null}
        </div>
      </td>

      <td className={TD}>
        <span className={isPromoPrice(result) ? "text-green-800 font-medium" : undefined}>
          {formatPrice(result.registrationPrice ?? result.regularPrice)}
        </span>
      </td>
      <td className={TD}>{formatPrice(result.renewalPrice)}</td>

      <td className={TD}>
        <div className="grid max-w-[360px] gap-1 leading-[1.35] text-ink-secondary">
          <span>{result.candidate.reason}</span>
          {result.message ? (
            <small className="font-bold text-caution">
              {result.message}
            </small>
          ) : null}
        </div>
      </td>

      <td className={TD}>
        <div className="flex min-w-[168px] items-center justify-end gap-2.5">
          {isDnsLoading ? (
            <span className="inline-flex items-center gap-1.5 text-[0.78rem] text-ink-secondary">
              <Loader2 className="animate-spin" size={14} aria-hidden="true" />
            </span>
          ) : canCheck ? (
            <button
              className="inline-flex min-h-8 items-center justify-center gap-2 rounded-md border border-border bg-white px-2.5 font-bold text-ink transition-colors duration-150 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              disabled={
                !hasCredentials ||
                checkingDomains.has(result.candidate.domain)
              }
              onClick={() => onCheck(result)}
              type="button"
            >
              {checkingDomains.has(result.candidate.domain) ? (
                <Loader2 className="animate-spin" size={14} aria-hidden="true" />
              ) : null}
              {result.availability === "unchecked" ? "Check" : "Retry"}
            </button>
          ) : (
            <StatusBadge availability={result.availability} />
          )}
          <a
            className="inline-flex items-center gap-1.5 whitespace-nowrap font-bold text-cobalt no-underline transition-colors duration-150 hover:text-vermillion"
            href={result.buyUrl}
            target="_blank"
            rel="noreferrer"
          >
            Porkbun
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </td>
    </tr>
  );
}
