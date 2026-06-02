import { NextResponse } from "next/server";
import { getPorkbunPricing } from "@/lib/porkbun";

export const dynamic = "force-dynamic";

export async function GET() {
  const pricing = await getPorkbunPricing();
  const tlds = Object.keys(pricing).sort((a, b) => a.localeCompare(b));

  const tldPricing: Record<string, { registration?: string; renewal?: string }> = {};
  for (const tld of tlds) {
    const p = pricing[tld];
    if (p) tldPricing[tld] = { registration: p.registration, renewal: p.renewal };
  }

  return NextResponse.json({ tlds, pricing: tldPricing });
}
