# Domain Finder

**[domain-finder.schenk.technology](https://domain-finder.schenk.technology)**

A Next.js app that generates creative domain name ideas for a project and surfaces pricing and availability through Porkbun.

Enter a project name and an optional description, and the app generates ranked domain candidates across multiple strategies — exact matches, prefixes, suffixes, domain hacks, brandable variants, and description-aware picks. Results include live Porkbun pricing, bulk DNS pre-checks, and optional per-domain availability checks.

## Features

- **Multi-strategy generation** — exact matches on common/niche TLDs, prefix variants (`use`, `get`, `try`, `go`, `join`), product suffixes (`app`, `tool`, `site`), brandable suffixes (`hq`, `labs`, `studio`, `works`, `tools`), domain hacks (e.g. `datafa.st`), and description-aware category variants.
- **Scoring & ranking** — heuristic scoring favors `.com`, common TLDs, shorter names, and description-relevant TLDs.
- **Grouped results** — candidates grouped by kind with collapsible TLD clusters.
- **Bulk DNS pre-check** — automatically marks domains with NS records as taken via Cloudflare DNS-over-HTTPS.
- **Live availability checks** — per-domain Porkbun API checks when API keys are configured.
- **Pricing display** — registration and renewal prices from Porkbun, with promo prices highlighted.
- **TLD browser** — fuzzy-searchable grid of all Porkbun TLDs to add any `brand.tld` to results.
- **Starred shortlist** — pin domains to a top section for easy comparison.
- **Domain text filter** — filter results by substring.
- **Direct checkout links** — one-click Porkbun purchase links.
- **Session persistence** — results and stars saved to IndexedDB per project.

## Tech Stack

- **Next.js 14** (App Router) with **React 18**
- **Tailwind CSS v4**
- **TypeScript**
- **Fuse.js** for fuzzy TLD search
- **Porkbun API** for pricing and availability
- **Cloudflare DNS-over-HTTPS** for bulk NS lookups
- **IndexedDB** for client-side session persistence

## Project Structure

```
app/
├── page.tsx                    Home — project name + description form
├── search/page.tsx             Results page
├── types.ts                    Shared types, grouping, formatting
├── components/
│   ├── domain-table.tsx        Grouped results table with star/check actions
│   ├── domain-parts.tsx        Color-coded SLD rendering
│   ├── status-badge.tsx        Availability badges
│   └── tld-browser.tsx         Searchable TLD grid
└── api/
    ├── search/route.ts         Generate candidates + attach pricing
    ├── check/route.ts          Single-domain Porkbun availability check
    ├── tlds/route.ts           List all Porkbun TLDs with pricing
    └── dns-check/route.ts      Bulk DNS NS-record check

lib/
├── domain-candidates.ts        Candidate generation engine
├── porkbun.ts                  Porkbun API client + pricing cache
├── dns-check.ts                Cloudflare DNS bulk checker
└── storage.ts                  IndexedDB session persistence
```

## Getting Started

Install dependencies:

```bash
npm install
```

Copy the env file:

```bash
cp .env.example .env.local
```

Optionally add your Porkbun API credentials in `.env.local` (see below), then start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORKBUN_API_KEY` | No | Enables per-domain live availability checks |
| `PORKBUN_SECRET_API_KEY` | No | Enables per-domain live availability checks |

Without API keys the app still generates candidates, shows pricing, and runs DNS pre-checks — availability just stays "Not checked" for domains without NS records.

## To Do

- [ ] Also look for domains like replacing l/i -> 1 or o -> 0 etc