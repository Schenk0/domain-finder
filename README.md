# Domain Finder (Sandbox)

A Next.js app that generates domain ideas for a project and lets you check availability through Porkbun.

It takes a project name and short description, generates candidate domains across multiple strategies, shows pricing when available, and supports one-click live checks on individual domains.

## What It Does

- Generates domains from several candidate types:
  - exact matches on common and niche TLDs
  - prefix variants (`use`, `get`, `try`, `go`, `join`)
  - product suffix variants (`app`, `tool`, `site`)
  - description-aware category variants
  - domain hacks (for example `datafa.st`)
  - brandable variants (`hq`, `labs`, `studio`, `works`, `tools`)
- Groups and ranks results with simple scoring heuristics.
- Shows Porkbun pricing metadata when available.
- Allows live availability checks per domain (when API keys are configured).
- Supports filtering by domain text and TLD.
- Supports starring domains into a shortlist panel.
- Includes direct Porkbun checkout links for each result.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env.local
```

3. Add your Porkbun API credentials in `.env.local` (optional, but required for live availability checks).

4. Start development:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Defined in `.env.example`:

- `PORKBUN_API_KEY` - required for live availability checks.
- `PORKBUN_SECRET_API_KEY` - required for live availability checks.
- `PORKBUN_CHECK_LIMIT` - currently not used by the app logic.

If credentials are missing, the app still works for candidate generation and pricing lookup, but availability remains `Not checked`.

## To Do

- [ ] Also look for domains like replacing l/i -> 1 or o -> 0 etc
- [ ] Switch check to another provider and check everything automatically
- [ ] Add custom search for more domains and TLDs