import type { DomainCandidate } from "@/lib/domain-candidates";

export type DomainAvailability = "available" | "taken" | "unchecked" | "rate-limited" | "error";

export type DomainResult = {
  candidate: DomainCandidate;
  availability: DomainAvailability;
  registrationPrice?: string;
  renewalPrice?: string;
  regularPrice?: string;
  transferPrice?: string;
  premium?: boolean;
  message?: string;
  buyUrl: string;
};

type PorkbunPricing = Record<
  string,
  {
    registration?: string;
    renewal?: string;
    transfer?: string;
  }
>;

type RawPorkbunPricing = Record<
  string,
  {
    registration?: string;
    renewal?: string;
    transfer?: string;
    specialType?: string;
  }
>;

type PorkbunCheckResponse = {
  status?: string;
  message?: string;
  response?: {
    avail?: "yes" | "no" | string;
    price?: string;
    regularPrice?: string;
    premium?: "yes" | "no" | string;
    firstYearPromo?: "yes" | "no" | string;
    type?: string;
  };
};

let pricingCache: { fetchedAt: number; data: PorkbunPricing } | null = null;

const PRICING_TTL_MS = 12 * 60 * 60 * 1000;

export function hasPorkbunCredentials() {
  return Boolean(process.env.PORKBUN_API_KEY && process.env.PORKBUN_SECRET_API_KEY);
}

export async function getPorkbunPricing() {
  if (pricingCache && Date.now() - pricingCache.fetchedAt < PRICING_TTL_MS) {
    return pricingCache.data;
  }

  const response = await fetchWithTimeout(
    "https://api.porkbun.com/api/json/v3/pricing/get",
    {
      next: { revalidate: 60 * 60 * 12 }
    },
    3500
  ).catch(() => null);

  if (!response?.ok) {
    return {};
  }

  const payload = (await response.json()) as { pricing?: RawPorkbunPricing };
  const raw = payload.pricing ?? {};

  const filtered: PorkbunPricing = {};
  for (const [tld, entry] of Object.entries(raw)) {
    if (entry.specialType === "handshake") continue;
    filtered[tld] = { registration: entry.registration, renewal: entry.renewal, transfer: entry.transfer };
  }

  pricingCache = { fetchedAt: Date.now(), data: filtered };

  return pricingCache.data;
}

export function makeBaseResult(
  candidate: DomainCandidate,
  pricing: PorkbunPricing
): DomainResult {
  const tldPricing = pricing[candidate.tld];

  return {
    candidate,
    availability: "unchecked",
    registrationPrice: tldPricing?.registration,
    renewalPrice: tldPricing?.renewal,
    transferPrice: tldPricing?.transfer,
    buyUrl: `https://porkbun.com/checkout/search?q=${encodeURIComponent(candidate.domain)}`
  };
}

export async function checkPorkbunDomain(
  candidate: DomainCandidate,
  pricing: PorkbunPricing
) {
  const baseResult = makeBaseResult(candidate, pricing);

  if (!hasPorkbunCredentials()) {
    return {
      ...baseResult,
      availability: "unchecked",
      message: "Add Porkbun API keys to check live availability."
    } satisfies DomainResult;
  }

  try {
    const response = await fetchWithTimeout(
      `https://api.porkbun.com/api/json/v3/domain/checkDomain/${candidate.domain}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          apikey: process.env.PORKBUN_API_KEY,
          secretapikey: process.env.PORKBUN_SECRET_API_KEY
        }),
        cache: "no-store"
      },
      6500
    );

    const payload = (await response.json().catch(() => ({}))) as PorkbunCheckResponse;
    const message = payload.message || response.statusText;

    if (!response.ok || payload.status !== "SUCCESS") {
      const isRateLimited = isPorkbunRateLimit(response.status, message);

      return {
        ...baseResult,
        availability: isRateLimited ? "rate-limited" : "error",
        message: isRateLimited
          ? "Porkbun rate limit reached. Try this domain again shortly."
          : message || "Porkbun could not check this domain."
      } satisfies DomainResult;
    }

    const result = payload.response;
    const isAvailable = result?.avail === "yes";

    return {
      ...baseResult,
      availability: isAvailable ? "available" : "taken",
      registrationPrice: result?.price ?? baseResult.registrationPrice,
      regularPrice: result?.regularPrice ?? baseResult.regularPrice,
      premium: result?.premium === "yes",
      message: isAvailable ? undefined : "Already registered or unavailable."
    } satisfies DomainResult;
  } catch (error) {
    return {
      ...baseResult,
      availability: "error",
      message: error instanceof Error ? error.message : "Porkbun request failed."
    } satisfies DomainResult;
  }
}

function isPorkbunRateLimit(status: number, message?: string) {
  if (status === 429) return true;

  return /rate|limit|too many|checks? within|checks? .* seconds/i.test(message ?? "");
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}
