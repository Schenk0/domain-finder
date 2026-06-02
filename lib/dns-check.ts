type DnsJsonResponse = {
  Status: number;
  Answer?: Array<{ name: string; type: number; data: string }>;
};

type DnsCheckResult = {
  domain: string;
  taken: boolean;
};

const CONCURRENCY = 50;
const TIMEOUT_MS = 4000;

export async function bulkDnsCheck(domains: string[]): Promise<DnsCheckResult[]> {
  const results: DnsCheckResult[] = [];

  for (let i = 0; i < domains.length; i += CONCURRENCY) {
    const batch = domains.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(batch.map(checkSingleDns));
    results.push(...batchResults);
  }

  return results;
}

async function checkSingleDns(domain: string): Promise<DnsCheckResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=NS`,
      {
        headers: { accept: "application/dns-json" },
        signal: controller.signal,
        cache: "no-store",
      }
    );

    clearTimeout(timeout);

    const data = (await response.json()) as DnsJsonResponse;

    // NS records in the Answer section (type 2 = NS) means the domain is delegated → taken
    const hasNsRecords =
      Array.isArray(data.Answer) &&
      data.Answer.some((record) => record.type === 2);

    return { domain, taken: hasNsRecords };
  } catch {
    // Network error or timeout — leave as unchecked (not taken)
    return { domain, taken: false };
  }
}
