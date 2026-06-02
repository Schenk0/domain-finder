import { NextResponse } from "next/server";
import { generateDomainCandidates } from "@/lib/domain-candidates";
import { getPorkbunPricing, hasPorkbunCredentials, makeBaseResult } from "@/lib/porkbun";

export const dynamic = "force-dynamic";

type SearchRequest = {
  projectName?: string;
  description?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SearchRequest;
  const projectName = body.projectName?.trim() ?? "";
  const description = body.description?.trim() ?? "";

  if (projectName.length < 2) {
    return NextResponse.json(
      { error: "Give the project a name with at least two characters." },
      { status: 400 }
    );
  }

  const pricing = await getPorkbunPricing();
  const pricingTlds = Object.keys(pricing);
  const hasCredentials = hasPorkbunCredentials();
  const candidates = generateDomainCandidates(projectName, description, pricingTlds);

  const results = candidates.map((candidate) => ({
    ...makeBaseResult(candidate, pricing),
    message: hasCredentials ? undefined : "Add Porkbun API keys to check live availability."
  }));

  return NextResponse.json({
    checked: 0,
    hasCredentials,
    pricingSource: "Porkbun",
    rateLimited: false,
    results
  });
}
