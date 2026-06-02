export type CandidateKind =
  | "exact-common"
  | "exact-specific"
  | "prefix"
  | "app-suffix"
  | "category"
  | "domain-hack"
  | "brandable"
  | "custom";

export type Result = {
  candidate: {
    domain: string;
    kind: CandidateKind;
    reason: string;
    score: number;
    sld: string;
    tld: string;
  };
  availability:
    | "available"
    | "taken"
    | "unchecked"
    | "rate-limited"
    | "error";
  registrationPrice?: string;
  renewalPrice?: string;
  regularPrice?: string;
  premium?: boolean;
  message?: string;
  buyUrl: string;
};

export type SearchResponse = {
  checked: number;
  hasCredentials: boolean;
  pricingSource: "Porkbun";
  rateLimited?: boolean;
  dnsChecked?: boolean;
  results: Result[];
  error?: string;
};

export type CheckResponse = {
  result?: Result;
  error?: string;
};

export const KIND_LABEL: Record<CandidateKind, string> = {
  "exact-common": "Common exact",
  "exact-specific": "Specific exact",
  prefix: "Prefix",
  "app-suffix": "Product suffix",
  category: "Related",
  "domain-hack": "Domain hack",
  brandable: "Brandable",
  custom: "Custom",
};

export const KIND_DESCRIPTION: Record<CandidateKind, string> = {
  "exact-common":
    "Bare project name across common TLDs like .com, .app, .io, and .xyz.",
  "exact-specific":
    "Bare project name across context or industry TLDs like .tech, .software, and .video.",
  prefix:
    "Adds use and action words like get, try, go, or join before the project name.",
  "app-suffix": "Adds clear product suffixes after the name.",
  category: "Adds words inferred from the project description.",
  "domain-hack":
    "Splits the name across the dot when the TLD completes the word.",
  brandable:
    "Adds lightweight brand suffixes like hq, labs, or studio.",
  custom: "Manually added TLD.",
};

export const KIND_ORDER: CandidateKind[] = [
  "exact-common",
  "exact-specific",
  "domain-hack",
  "prefix",
  "app-suffix",
  "category",
  "brandable",
];

export const ACTION_PREFIXES = ["get", "try", "go", "join"];
export const KNOWN_PREFIXES = ["use", ...ACTION_PREFIXES];
export const VARIANT_TLD_ORDER = [
  "com", "ai", "app", "dev", "io", "co", "net", "org", "xyz", "so", "sh",
];

export const ADDED_SUFFIXES = [
  "academy", "agent", "ai", "api", "app", "audio", "books", "brand", "care",
  "cash", "chat", "clips", "data", "design", "dev", "finance", "fit",
  "health", "hq", "insights", "labs", "learn", "market", "metrics", "school",
  "shop", "site", "studio", "store", "tool", "tools", "video", "voice",
  "works",
].sort((a, b) => b.length - a.length);

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function groupResults(results: Result[]) {
  return KIND_ORDER.map((kind) => ({
    kind,
    results: results.filter((r) => r.candidate.kind === kind),
  })).filter((g) => g.results.length > 0 || g.kind === "domain-hack");
}

export function isDomainVariantCollapsedKind(kind: CandidateKind) {
  return kind !== "exact-common" && kind !== "exact-specific";
}

export function clusterKindResults(results: Result[], kind: CandidateKind) {
  const bySld = new Map<string, Result[]>();

  for (const result of results) {
    const sld = result.candidate.sld;
    const existing = bySld.get(sld);
    if (existing) {
      existing.push(result);
    } else {
      bySld.set(sld, [result]);
    }
  }

  return [...bySld.entries()].map(([sld, variants]) => {
    const sorted = [...variants].sort((a, b) => {
      const aRank = variantTldRank(a.candidate.tld);
      const bRank = variantTldRank(b.candidate.tld);
      if (aRank !== bRank) return aRank - bRank;
      return a.candidate.domain.localeCompare(b.candidate.domain, undefined, {
        sensitivity: "base",
      });
    });
    const primary = choosePrimaryVariant(sorted);

    return {
      key: `${kind}:${sld}`,
      primary,
      variants: sorted.filter(
        (v) => v.candidate.domain !== primary.candidate.domain
      ),
    };
  });
}

function choosePrimaryVariant(variants: Result[]) {
  return (
    variants.find((v) => v.candidate.tld.toLowerCase() === "com") ??
    variants[0]
  );
}

function variantTldRank(tld: string) {
  const idx = VARIANT_TLD_ORDER.indexOf(tld.toLowerCase());
  return idx === -1 ? VARIANT_TLD_ORDER.length : idx;
}

export function sortResultsByDomain(results: Result[]) {
  return [...results].sort(
    (a, b) =>
      a.candidate.sld.localeCompare(b.candidate.sld, undefined, {
        sensitivity: "base",
      }) ||
      a.candidate.tld.localeCompare(b.candidate.tld, undefined, {
        sensitivity: "base",
      })
  );
}

export function formatPrice(price?: string) {
  return price ? `$${price}` : "Pending";
}

export function tableSummary(response: SearchResponse, dnsChecking?: boolean) {
  if (dnsChecking) {
    return "Checking DNS records to find taken domains\u2026";
  }
  const takenCount = response.results.filter((r) => r.availability === "taken").length;
  const uncheckedCount = response.results.filter((r) => r.availability === "unchecked").length;
  if (response.dnsChecked && takenCount > 0) {
    const parts = [`${takenCount} taken via DNS.`];
    if (uncheckedCount > 0 && response.hasCredentials) {
      parts.push(`Click Check on the remaining ${uncheckedCount} to verify via Porkbun.`);
    } else if (!response.hasCredentials) {
      parts.push("Add Porkbun API keys to verify the rest.");
    }
    return parts.join(" ");
  }
  if (!response.hasCredentials) {
    return "Showing Porkbun pricing. Add API keys to check live availability.";
  }
  if (response.rateLimited) {
    return "One live check hit Porkbun\u2019s API rate limit. Try another domain shortly.";
  }
  return "Click Check on individual rows to run a live Porkbun availability check.";
}

export function statusLabel(status: Result["availability"]) {
  if (status === "available") return "Available";
  if (status === "taken") return "Taken";
  if (status === "rate-limited") return "Limited";
  if (status === "error") return "Error";
  return "Not checked";
}

export function emptyGroupMessage(kind: CandidateKind) {
  if (kind === "domain-hack") {
    return "No domain hacks were found for this domain.";
  }
  return `No ${KIND_LABEL[kind].toLowerCase()} domains were found.`;
}

export function normalizeBrand(projectName: string) {
  const words = projectName
    .toLowerCase()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[^a-z0-9]+/i)
    .map((w) => w.trim())
    .filter(Boolean);

  return words
    .join("")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63) || null;
}
