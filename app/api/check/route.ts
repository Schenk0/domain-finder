import { NextResponse } from "next/server";
import type { CandidateKind, DomainCandidate } from "@/lib/domain-candidates";
import {
  checkPorkbunDomain,
  getPorkbunPricing,
  hasPorkbunCredentials,
  makeBaseResult
} from "@/lib/porkbun";

export const dynamic = "force-dynamic";

type CheckRequest = {
  candidate?: Partial<DomainCandidate>;
};

const CANDIDATE_KINDS: CandidateKind[] = [
  "exact-common",
  "exact-specific",
  "prefix",
  "app-suffix",
  "category",
  "domain-hack",
  "brandable",
  "custom"
];

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CheckRequest;
  const candidate = normalizeCandidate(body.candidate);

  if (!candidate) {
    return NextResponse.json({ error: "Invalid domain candidate." }, { status: 400 });
  }

  const pricing = await getPorkbunPricing();

  if (!hasPorkbunCredentials()) {
    return NextResponse.json({
      result: {
        ...makeBaseResult(candidate, pricing),
        message: "Add Porkbun API keys to check live availability."
      }
    });
  }

  return NextResponse.json({
    result: await checkPorkbunDomain(candidate, pricing)
  });
}

function normalizeCandidate(candidate?: Partial<DomainCandidate>) {
  if (!candidate) return null;

  const sld = candidate.sld?.toLowerCase().trim() ?? "";
  const tld = candidate.tld?.toLowerCase().trim() ?? "";
  const domain = `${sld}.${tld}`;
  const kind = candidate.kind;

  if (!CANDIDATE_KINDS.includes(kind as CandidateKind)) return null;
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(sld)) return null;
  if (!/^[a-z0-9][a-z0-9-]{1,62}$/.test(tld)) return null;
  if (candidate.domain?.toLowerCase() !== domain) return null;

  return {
    domain,
    label: domain,
    sld,
    tld,
    kind: kind as CandidateKind,
    reason: candidate.reason ?? "Generated domain candidate.",
    score: Number(candidate.score ?? 0)
  } satisfies DomainCandidate;
}
