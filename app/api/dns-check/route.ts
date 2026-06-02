import { NextResponse } from "next/server";
import { bulkDnsCheck } from "@/lib/dns-check";

export const dynamic = "force-dynamic";

type DnsCheckRequest = {
  domains?: string[];
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as DnsCheckRequest;
  const domains = body.domains;

  if (!Array.isArray(domains) || domains.length === 0) {
    return NextResponse.json({ error: "Provide a domains array." }, { status: 400 });
  }

  if (domains.length > 300) {
    return NextResponse.json({ error: "Too many domains (max 300)." }, { status: 400 });
  }

  const valid = domains.filter(
    (d): d is string => typeof d === "string" && /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(d)
  );

  const results = await bulkDnsCheck(valid);

  return NextResponse.json({ results });
}
