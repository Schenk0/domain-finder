"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronUp, Loader2, Plus, Search, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { DomainTable } from "../components/domain-table";
import { TldBrowser } from "../components/tld-browser";
import {
  cx,
  normalizeBrand,
  sortResultsByDomain,
  tableSummary,
  type CheckResponse,
  type Result,
  type SearchResponse,
} from "../types";
import { loadSession, saveSession } from "@/lib/storage";

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const projectName = searchParams.get("q") ?? "";
  const description = searchParams.get("d") ?? "";

  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingDomains, setCheckingDomains] = useState<Set<string>>(new Set());
  const [starredDomains, setStarredDomains] = useState<Set<string>>(new Set());
  const [dnsChecking, setDnsChecking] = useState(false);
  const [domainFilter, setDomainFilter] = useState("");
  const [error, setError] = useState("");
  const [porkbunTlds, setPorkbunTlds] = useState<string[]>([]);
  const [tldPricing, setTldPricing] = useState<Record<string, { registration?: string; renewal?: string }>>({});
  const [showTldBrowser, setShowTldBrowser] = useState(false);
  const initRef = useRef(false);

  const brand = useMemo(() => normalizeBrand(projectName), [projectName]);

  const fetchPorkbunTlds = useCallback(async () => {
    try {
      const res = await fetch("/api/tlds");
      const payload = (await res.json()) as {
        tlds?: string[];
        pricing?: Record<string, { registration?: string; renewal?: string }>;
      };
      if (Array.isArray(payload.tlds)) setPorkbunTlds(payload.tlds);
      if (payload.pricing) setTldPricing(payload.pricing);
    } catch {
      // TLD list is a convenience, not blocking
    }
  }, []);

  useEffect(() => { fetchPorkbunTlds(); }, [fetchPorkbunTlds]);

  // Redirect to home if no query params
  useEffect(() => {
    if (!projectName) router.replace("/");
  }, [projectName, router]);

  // On mount: try to restore from cache, otherwise auto-search
  useEffect(() => {
    if (initRef.current || !projectName) return;
    initRef.current = true;

    loadSession(projectName, description).then((session) => {
      if (session) {
        setResponse(session.response);
        setStarredDomains(new Set(session.starredDomains));
      } else {
        triggerSearch();
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to IndexedDB whenever response or stars change
  useEffect(() => {
    if (!response) return;
    saveSession({
      projectName,
      description,
      response,
      starredDomains: [...starredDomains],
      savedAt: Date.now(),
    });
  }, [response, starredDomains, projectName, description]);

  const visibleResults = useMemo(() => {
    if (!response) return [];
    const df = domainFilter.trim().toLowerCase();
    if (!df) return sortResultsByDomain(response.results);
    return sortResultsByDomain(
      response.results.filter((r) => r.candidate.domain.toLowerCase().includes(df))
    );
  }, [response, domainFilter]);

  const starredResults = useMemo(
    () => visibleResults.filter((r) => starredDomains.has(r.candidate.domain)),
    [visibleResults, starredDomains]
  );

  async function triggerSearch() {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectName, description }),
      });
      const payload = (await res.json()) as SearchResponse;
      if (!res.ok || payload.error) {
        setError(payload.error ?? "Search failed.");
        setResponse(null);
        return;
      }
      setResponse(payload);
      setCheckingDomains(new Set());
      setStarredDomains(new Set());
      setDomainFilter("");
      setShowTldBrowser(false);
      runDnsCheck(payload.results.map((r) => r.candidate.domain));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function runDnsCheck(domains: string[]) {
    setDnsChecking(true);
    try {
      const res = await fetch("/api/dns-check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ domains }),
      });
      const payload = (await res.json()) as {
        results?: Array<{ domain: string; taken: boolean }>;
      };
      if (!Array.isArray(payload.results)) return;

      const takenSet = new Set(
        payload.results.filter((r) => r.taken).map((r) => r.domain)
      );

      setResponse((current) => {
        if (!current) return current;
        return {
          ...current,
          dnsChecked: true,
          results: current.results.map((row) =>
            takenSet.has(row.candidate.domain) && row.availability === "unchecked"
              ? { ...row, availability: "taken" as const, message: undefined }
              : row
          ),
        };
      });
    } catch {
      // DNS check failed — domains stay as unchecked
    } finally {
      setDnsChecking(false);
    }
  }

  async function handleCheck(result: Result) {
    const domain = result.candidate.domain;
    setError("");
    setCheckingDomains((s) => new Set(s).add(domain));
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ candidate: result.candidate }),
      });
      const payload = (await res.json()) as CheckResponse;
      if (!res.ok || payload.error || !payload.result) {
        markDomainError(domain, payload.error ?? "Could not check that domain.");
        return;
      }
      setResponse((current) => {
        if (!current) return current;
        return {
          ...current,
          rateLimited: current.rateLimited || payload.result?.availability === "rate-limited",
          results: current.results.map((row) =>
            row.candidate.domain === domain ? (payload.result as Result) : row
          ),
        };
      });
    } catch (e) {
      markDomainError(domain, e instanceof Error ? e.message : "Could not check that domain.");
    } finally {
      setCheckingDomains((s) => {
        const next = new Set(s);
        next.delete(domain);
        return next;
      });
    }
  }

  function markDomainError(domain: string, msg: string) {
    setResponse((current) => {
      if (!current) return current;
      return {
        ...current,
        results: current.results.map((row) =>
          row.candidate.domain === domain
            ? { ...row, availability: "error" as const, message: msg }
            : row
        ),
      };
    });
  }

  function handleToggleStar(domain: string) {
    setStarredDomains((s) => {
      const next = new Set(s);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  }

  const existingDomains = useMemo(
    () => new Set(response?.results.map((r) => r.candidate.domain) ?? []),
    [response]
  );

  const addedCustomTlds = useMemo(() => {
    if (!brand) return new Set<string>();
    const result = new Set<string>();
    for (const domain of starredDomains) {
      const dot = domain.indexOf(".");
      if (dot < 1) continue;
      if (domain.slice(0, dot) === brand) result.add(domain.slice(dot + 1));
    }
    return result;
  }, [brand, starredDomains]);

  function handleAddTld(tld: string) {
    if (!brand) return;
    const domain = `${brand}.${tld}`;

    if (existingDomains.has(domain)) {
      setStarredDomains((s) => new Set(s).add(domain));
      return;
    }

    const price = tldPricing[tld];
    const result: Result = {
      candidate: {
        domain,
        kind: "custom",
        reason: `Added .${tld} for "${brand}".`,
        score: 0,
        sld: brand,
        tld,
      },
      availability: "unchecked",
      registrationPrice: price?.registration,
      renewalPrice: price?.renewal,
      buyUrl: `https://porkbun.com/checkout/search?q=${encodeURIComponent(domain)}`,
    };

    setResponse((current) => {
      if (!current) {
        return {
          checked: 0,
          hasCredentials: false,
          pricingSource: "Porkbun",
          results: [result],
        };
      }
      return { ...current, results: [...current.results, result] };
    });

    setStarredDomains((s) => new Set(s).add(domain));
    runDnsCheck([domain]);
  }

  if (!projectName) return null;

  return (
    <main className="mx-auto w-[min(1180px,calc(100%-32px))] pb-18 pt-6 max-[580px]:w-[min(100%-22px,1180px)] max-[580px]:pb-11 max-[580px]:pt-4">
      {/* Top bar */}
      <div className="mb-6 flex items-start justify-between gap-5 max-[860px]:flex-col max-[860px]:gap-4">
        <div className="min-w-0">
          <Link
            href="/"
            className="mb-3 inline-flex items-center gap-1.5 text-[0.82rem] font-bold text-ink-secondary no-underline transition-colors duration-150 hover:text-vermillion"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            New search
          </Link>
          <h1 className="m-0 font-display text-[clamp(1.8rem,5vw,3.2rem)] font-bold leading-[0.92] tracking-[-0.025em] text-ink [overflow-wrap:anywhere] [text-wrap:balance]">
            {projectName}
          </h1>
          {description && (
            <p className="mt-2 max-w-[65ch] text-[0.92rem] leading-[1.45] text-ink-secondary [overflow-wrap:anywhere] [text-wrap:pretty]">
              {description}
            </p>
          )}
        </div>

{isLoading && response && (
          <span className="inline-flex shrink-0 items-center gap-2 text-[0.92rem] text-ink-secondary">
            <Loader2 className="animate-spin" size={18} aria-hidden="true" />
            Searching…
          </span>
        )}
      </div>

      {/* Loading state before first results */}
      {isLoading && !response && (
        <div className="flex items-center justify-center gap-3 py-20 text-ink-secondary">
          <Loader2 className="animate-spin" size={22} aria-hidden="true" />
          <span className="text-[1rem]">Generating domain candidates…</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div
          className="mt-4 flex items-center gap-2.5 rounded-lg border border-taken/20 bg-taken-bg px-4 py-3.5 text-taken"
          role="alert"
        >
          <TriangleAlert size={18} aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Results */}
      {response && (
        <section className="grid gap-5" aria-live="polite">
          <div className="overflow-visible rounded-lg border border-border bg-white">
            <div className="flex items-start justify-between gap-5 border-b border-border px-5 py-5 max-[860px]:flex-col max-[860px]:items-stretch">
              <div>
                <p className="mb-2 text-[0.76rem] font-bold uppercase tracking-[0.02em] text-vermillion">
                  Shortlist
                </p>
                <h2 className="m-0 font-display text-[clamp(1.4rem,3vw,2rem)] leading-[1.15] tracking-[-0.015em] text-ink [overflow-wrap:anywhere] [text-wrap:balance]">
                  Domain candidates
                </h2>
              </div>
              <p className="mt-1 max-w-[380px] text-right text-[0.92rem] leading-[1.45] text-ink-secondary max-[860px]:mt-0 max-[860px]:max-w-none max-[860px]:text-left [text-wrap:pretty]">
                {tableSummary(response, dnsChecking)}
              </p>
            </div>

            {/* Filter bar */}
            <div
              className="flex items-center gap-2.5 border-b border-border bg-white px-5 py-3 max-[860px]:flex-col max-[860px]:items-stretch max-[860px]:gap-2"
              aria-label="Table controls"
            >
              <div className="flex h-[34px] max-w-[280px] flex-1 items-center gap-2.5 rounded-md border border-border bg-white px-3 transition-colors duration-150 focus-within:border-cobalt focus-within:ring-[3px] focus-within:ring-cobalt/15 max-[860px]:max-w-none">
                <Search className="shrink-0 text-ink-secondary" size={14} aria-hidden="true" />
                <input
                  className="h-8 w-full min-w-0 border-0 bg-transparent text-[0.82rem] text-ink outline-none placeholder:text-ink-secondary"
                  aria-label="Filter domains by name"
                  onChange={(e) => setDomainFilter(e.target.value)}
                  placeholder="Filter domain"
                  value={domainFilter}
                />
              </div>
              <button
                type="button"
                className={cx(
                  "inline-flex h-[34px] items-center gap-1.5 rounded-md border px-3 text-[0.82rem] font-bold transition-colors duration-150",
                  showTldBrowser
                    ? "border-vermillion bg-vermillion text-white hover:bg-vermillion-hover"
                    : "border-border bg-white text-ink hover:bg-surface"
                )}
                onClick={() => setShowTldBrowser((v) => !v)}
              >
                {showTldBrowser ? (
                  <ChevronUp size={14} aria-hidden="true" />
                ) : (
                  <Plus size={14} aria-hidden="true" />
                )}
                {showTldBrowser ? "Close" : "Add new TLD"}
              </button>
              <p className="ml-auto shrink-0 text-[0.82rem] text-ink-secondary max-[860px]:ml-0">
                Showing {visibleResults.length} domain
                {visibleResults.length === 1 ? "" : "s"}.
              </p>
            </div>

            {showTldBrowser && (
              <TldBrowser
                allTlds={porkbunTlds}
                tldPricing={tldPricing}
                brand={brand}
                addedTlds={addedCustomTlds}
                onAdd={handleAddTld}
              />
            )}

            <DomainTable
              checkingDomains={checkingDomains}
              dnsChecking={dnsChecking}
              grouped
              hasCredentials={response.hasCredentials}
              onCheck={handleCheck}
              onToggleStar={handleToggleStar}
              results={visibleResults}
              starredResults={starredResults}
              starredDomains={starredDomains}
            />
          </div>
        </section>
      )}
    </main>
  );
}
