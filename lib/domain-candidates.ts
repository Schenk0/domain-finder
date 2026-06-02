export type CandidateKind =
  | "exact-common"
  | "exact-specific"
  | "prefix"
  | "app-suffix"
  | "category"
  | "domain-hack"
  | "brandable"
  | "custom";

export type DomainCandidate = {
  domain: string;
  label: string;
  sld: string;
  tld: string;
  kind: CandidateKind;
  reason: string;
  score: number;
};

type CategoryRule = {
  keywords: string[];
  tlds: string[];
  words: string[];
};

const CORE_TLDS = [
  "com",
  "app",
  "ai",
  "dev",
  "io",
  "co",
  "net",
  "org",
  "xyz",
  "so",
  "sh",
  "tools",
  "software",
  "studio",
  "site",
  "online",
  "tech",
  "digital",
  "works"
];

const COMMON_EXACT_TLDS = ["com", "app", "ai", "dev", "io", "co", "net", "org", "xyz", "so", "sh"];

const HACK_TLDS = [
  "ai",
  "am",
  "app",
  "art",
  "at",
  "be",
  "bio",
  "chat",
  "co",
  "de",
  "dev",
  "do",
  "fm",
  "gg",
  "io",
  "is",
  "it",
  "ly",
  "me",
  "no",
  "one",
  "pm",
  "pro",
  "re",
  "run",
  "sh",
  "so",
  "st",
  "to",
  "tv",
  "us",
  "vc",
  "video",
  "work",
  "wtf",
  "xyz"
];

const CATEGORY_RULES: CategoryRule[] = [
  {
    keywords: ["video", "clip", "movie", "stream", "record", "camera", "creator"],
    tlds: ["video", "tv", "media", "studio", "camera"],
    words: ["video", "studio", "clips"]
  },
  {
    keywords: ["audio", "music", "podcast", "sound", "voice"],
    tlds: ["audio", "fm", "music", "studio"],
    words: ["audio", "voice", "studio"]
  },
  {
    keywords: ["finance", "money", "bank", "invest", "invoice", "accounting", "tax"],
    tlds: ["finance", "money", "cash", "fund", "accountants"],
    words: ["finance", "cash", "books"]
  },
  {
    keywords: ["data", "analytics", "metric", "dashboard", "report", "insight"],
    tlds: ["data", "analytics", "cloud", "systems"],
    words: ["data", "metrics", "insights"]
  },
  {
    keywords: ["design", "brand", "logo", "creative", "portfolio"],
    tlds: ["design", "studio", "art", "graphics"],
    words: ["design", "studio", "brand"]
  },
  {
    keywords: ["developer", "code", "api", "software", "tool", "automation", "deploy"],
    tlds: ["dev", "tools", "software", "systems", "cloud"],
    words: ["dev", "tools", "api"]
  },
  {
    keywords: ["ai", "agent", "prompt", "model", "assistant", "chat"],
    tlds: ["ai", "chat", "bot", "app"],
    words: ["ai", "agent", "chat"]
  },
  {
    keywords: ["shop", "commerce", "store", "market", "sell", "checkout"],
    tlds: ["shop", "store", "market", "boutique"],
    words: ["shop", "store", "market"]
  },
  {
    keywords: ["learn", "course", "school", "teach", "education", "lesson"],
    tlds: ["academy", "education", "school", "training"],
    words: ["learn", "academy", "school"]
  },
  {
    keywords: ["health", "fitness", "doctor", "wellness", "med", "care"],
    tlds: ["health", "care", "fitness", "clinic"],
    words: ["health", "care", "fit"]
  }
];

const TLD_ASSOCIATIONS: Record<string, string[]> = {
  // Construction & trades
  pipes: ["plumbing"],
  drain: ["plumbing"],
  faucet: ["plumbing"],
  toilet: ["plumbing"],
  leak: ["plumbing"],
  water: ["plumbing"],
  wiring: ["electrical"],
  electrician: ["electrical"],
  circuit: ["electrical"],
  build: ["construction", "builders"],
  contractor: ["construction", "contractors"],
  renovation: ["construction", "builders"],
  remodel: ["construction", "builders"],
  roof: ["construction"],
  hvac: ["cooling", "heating"],
  heating: ["heating"],
  cooling: ["cooling"],

  // Food & hospitality
  food: ["restaurant", "catering", "kitchen"],
  chef: ["restaurant", "catering", "kitchen"],
  dining: ["restaurant"],
  eat: ["restaurant"],
  meal: ["restaurant", "catering"],
  cook: ["kitchen", "recipes"],
  recipe: ["recipes", "kitchen"],
  bar: ["bar", "pub"],
  beer: ["bar", "pub"],
  wine: ["wine", "bar"],
  coffee: ["coffee", "cafe"],
  pizza: ["pizza"],
  hotel: ["hotel"],
  travel: ["travel", "voyage", "vacations"],
  tour: ["tours", "travel"],
  vacation: ["vacations", "travel"],
  flight: ["flights", "travel"],
  booking: ["booking"],

  // Legal & professional services
  lawyer: ["legal", "law", "attorney"],
  attorney: ["legal", "law", "attorney"],
  court: ["legal", "law"],
  lawsuit: ["legal", "law"],
  contract: ["legal", "law"],
  consult: ["consulting"],
  advisory: ["consulting"],
  recruit: ["careers", "jobs"],
  hire: ["careers", "jobs"],
  job: ["jobs", "careers"],
  career: ["careers"],

  // Real estate & property
  house: ["realestate", "property", "homes"],
  apartment: ["realestate", "apartments"],
  rent: ["rentals"],
  tenant: ["rentals"],
  mortgage: ["mortgage", "realestate"],
  property: ["realestate", "property"],
  land: ["land"],

  // Automotive & transport
  car: ["auto", "cars"],
  vehicle: ["auto", "cars"],
  truck: ["auto"],
  mechanic: ["auto", "repair"],
  drive: ["auto"],
  taxi: ["taxi", "cab"],
  delivery: ["delivery", "express"],
  ship: ["shipping"],
  freight: ["shipping", "express"],

  // Fashion & beauty
  fashion: ["fashion", "clothing", "style"],
  clothes: ["fashion", "clothing"],
  dress: ["fashion", "clothing"],
  beauty: ["beauty", "salon"],
  hair: ["salon", "hair"],
  makeup: ["beauty"],
  spa: ["spa"],
  nail: ["salon"],

  // Pet & animal
  pet: ["pet", "vet"],
  dog: ["pet", "dog"],
  cat: ["pet"],
  vet: ["vet"],
  animal: ["pet", "vet"],

  // Photography & visual
  photo: ["photography", "photos", "gallery"],
  camera: ["photography", "camera"],
  picture: ["photography", "photos"],
  portrait: ["photography"],
  wedding: ["wedding"],

  // Sports & recreation
  sport: ["sport", "fitness"],
  gym: ["fitness"],
  yoga: ["yoga", "fitness"],
  golf: ["golf"],
  soccer: ["soccer", "football"],
  football: ["football"],
  bike: ["bike"],
  fish: ["fishing"],
  camp: ["camping"],
  ski: ["ski"],

  // Religion & community
  church: ["church"],
  faith: ["church"],
  worship: ["church"],
  pray: ["church"],
  charity: ["charity", "giving"],
  donate: ["charity", "giving"],
  nonprofit: ["charity", "ngo"],

  // Technology specifics
  cloud: ["cloud"],
  host: ["hosting"],
  server: ["hosting", "systems"],
  network: ["network"],
  security: ["security"],
  cyber: ["security"],
  game: ["games", "game"],
  play: ["games"],
  mobile: ["mobile", "app"],
  email: ["email"],

  // Agriculture & nature
  farm: ["farm"],
  garden: ["garden"],
  organic: ["organic", "green"],
  solar: ["solar", "energy"],
  energy: ["energy"],
  green: ["green", "eco"],

  // Entertainment
  movie: ["movie", "film"],
  film: ["film"],
  theater: ["theater"],
  dance: ["dance"],
  event: ["events"],
  party: ["party"],
  ticket: ["tickets"],

  // Insurance & finance extras
  insure: ["insurance"],
  policy: ["insurance"],
  loan: ["loans", "credit"],
  credit: ["credit"],
  crypto: ["exchange"],
  trade: ["trading", "exchange"],
};

const NOISY_STEM_TLDS = new Set([
  "art", "at", "be", "chat", "co", "de", "do", "fm", "gg", "io", "is",
  "it", "ly", "me", "no", "one", "pm", "pro", "re", "run", "sh", "so",
  "st", "to", "tv", "us", "vc", "work", "wtf", "am", "in", "on",
]);

const ACTION_PREFIXES = ["get", "try", "go", "join"];

const BRANDABLE_SUFFIXES = ["hq", "labs", "studio", "works", "tools"];
const EXPANDABLE_VARIANT_TLDS = ["com", "ai", "app", "dev", "io", "co", "net", "org", "xyz"];
const MAX_CANDIDATES = 220;

export function generateDomainCandidates(
  projectName: string,
  description: string,
  pricingTlds: string[] = []
): DomainCandidate[] {
  const words = tokenize(`${projectName} ${description}`);
  const nameWords = tokenize(projectName);
  const brand = normalizeLabel(nameWords.join("")) || normalizeLabel(projectName);
  if (!brand) {
    return [];
  }

  const context = words.join(" ");
  const categoryRules = CATEGORY_RULES.filter((rule) =>
    rule.keywords.some((keyword) => context.includes(keyword))
  );

  const categoryTlds = categoryRules.flatMap((rule) => rule.tlds);
  const categoryWords = categoryRules.flatMap((rule) => rule.words);
  const discovered = discoverRelevantTlds(words, pricingTlds);
  const discoveredTlds = discovered.map((d) => d.tld);
  const discoveredMap = new Map(discovered.map((d) => [d.tld, d.source]));
  const candidateTlds = unique([...CORE_TLDS, ...categoryTlds, ...discoveredTlds]).filter((tld) =>
    canUseTld(tld, pricingTlds)
  );

  const candidates: DomainCandidate[] = [];

  for (const tld of candidateTlds) {
    const kind = COMMON_EXACT_TLDS.includes(tld) ? "exact-common" : "exact-specific";

    addCandidate(candidates, {
      sld: brand,
      tld,
      kind,
      reason: tldReason(tld, categoryTlds, discoveredMap),
      score: scoreDomain(brand, tld, kind, categoryTlds, discoveredMap)
    });
  }

  for (const tld of EXPANDABLE_VARIANT_TLDS) {
    if (!canUseTld(tld, pricingTlds)) continue;

    addCandidate(candidates, {
      sld: `use${brand}`,
      tld,
      kind: "prefix",
      reason: "Common SaaS-style fallback when the bare name is gone.",
      score: scoreDomain(`use${brand}`, tld, "prefix", categoryTlds, discoveredMap)
    });

    for (const prefix of ACTION_PREFIXES) {
      addCandidate(candidates, {
        sld: `${prefix}${brand}`,
        tld,
        kind: "prefix",
        reason: `Action-style alternative: ${prefix} ${brand}.`,
        score: scoreDomain(`${prefix}${brand}`, tld, "prefix", categoryTlds, discoveredMap)
      });
    }
  }

  for (const tld of EXPANDABLE_VARIANT_TLDS) {
    if (!canUseTld(tld, pricingTlds)) continue;
    for (const suffix of ["app", "tool", "site"]) {
      addCandidate(candidates, {
        sld: `${brand}${suffix}`,
        tld,
        kind: "app-suffix",
        reason: `Clear product fallback using "${suffix}" after the name.`,
        score: scoreDomain(`${brand}${suffix}`, tld, "app-suffix", categoryTlds, discoveredMap)
      });
    }
  }

  for (const word of unique(categoryWords).slice(0, 5)) {
    for (const tld of EXPANDABLE_VARIANT_TLDS) {
      if (!canUseTld(tld, pricingTlds)) continue;
      addCandidate(candidates, {
        sld: `${brand}${word}`,
        tld,
        kind: "category",
        reason: `Description-aware option related to ${word}.`,
        score: scoreDomain(`${brand}${word}`, tld, "category", categoryTlds, discoveredMap)
      });
    }
  }

  for (const suffix of BRANDABLE_SUFFIXES) {
    for (const tld of EXPANDABLE_VARIANT_TLDS) {
      if (!canUseTld(tld, pricingTlds)) continue;
      addCandidate(candidates, {
        sld: `${brand}${suffix}`,
        tld,
        kind: "brandable",
        reason: `Brandable fallback using ${suffix}.`,
        score: scoreDomain(`${brand}${suffix}`, tld, "brandable", categoryTlds, discoveredMap)
      });
    }
  }

  for (const hack of buildDomainHacks(brand, pricingTlds)) {
    addCandidate(candidates, {
      sld: hack.sld,
      tld: hack.tld,
      kind: "domain-hack",
      reason: `Domain hack: reads like "${brand}".`,
      score: scoreDomain(hack.sld, hack.tld, "domain-hack", categoryTlds, discoveredMap)
    });
  }

  return candidates
    .sort((a, b) => b.score - a.score || a.domain.length - b.domain.length)
    .slice(0, MAX_CANDIDATES);
}

function addCandidate(
  candidates: DomainCandidate[],
  input: Omit<DomainCandidate, "domain" | "label">
) {
  if (!input.sld || input.sld.length < 2 || input.sld.length > 63) return;
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(input.sld)) return;

  const domain = `${input.sld}.${input.tld}`;
  if (candidates.some((candidate) => candidate.domain === domain)) return;

  candidates.push({
    ...input,
    domain,
    label: domain
  });
}

function buildDomainHacks(brand: string, pricingTlds: string[]) {
  const hackTlds = unique([...HACK_TLDS, ...pricingTlds]).filter((tld) => tld.length > 1);
  return hackTlds
    .filter((tld) => brand.endsWith(tld))
    .map((tld) => ({
      sld: brand.slice(0, -tld.length),
      tld
    }))
    .filter((candidate) => candidate.sld.length >= 3);
}

function scoreDomain(
  sld: string,
  tld: string,
  kind: CandidateKind,
  categoryTlds: string[],
  discoveredMap: Map<string, DiscoveredTld["source"]> = new Map()
) {
  let score = 100;

  if (tld === "com") score += 18;
  if (["app", "ai", "dev", "io", "co"].includes(tld)) score += 12;
  if (categoryTlds.includes(tld)) score += 16;

  const discoverySource = discoveredMap.get(tld);
  if (discoverySource === "direct") score += 16;
  else if (discoverySource === "stem") score += 14;
  else if (discoverySource === "association") score += 12;

  if (kind === "domain-hack") score += 11;
  if (kind === "exact-common" || kind === "exact-specific") score += 9;
  if (kind === "exact-specific") score -= 2;
  if (kind === "prefix" || kind === "app-suffix") score += 3;

  score -= Math.max(0, sld.length - 10) * 1.5;
  score -= (sld.match(/-/g) ?? []).length * 4;

  return Math.round(score);
}

function tldReason(
  tld: string,
  categoryTlds: string[],
  discoveredMap: Map<string, DiscoveredTld["source"]> = new Map()
) {
  if (categoryTlds.includes(tld)) {
    return `Relevant TLD suggested by the project description: .${tld}.`;
  }

  const source = discoveredMap.get(tld);
  if (source === "direct") return `Matched directly from your description: .${tld}.`;
  if (source === "stem") return `Related industry TLD discovered from your description: .${tld}.`;
  if (source === "association") return `Industry-specific TLD associated with your description: .${tld}.`;

  if (tld === "com") return "The default commercial domain people still try first.";
  if (tld === "app") return "A strong fit for apps and productized tools.";
  if (tld === "ai") return "Useful when the project has an AI or automation angle.";
  if (tld === "dev") return "A clean fit for developer products and technical tools.";
  return `Popular modern alternative using .${tld}.`;
}

function tokenize(input: string) {
  return input
    .toLowerCase()
    .replace(/https?:\/\//g, " ")
    .replace(/\.[a-z]{2,}$/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[^a-z0-9]+/i)
    .map((word) => word.trim())
    .filter(Boolean);
}

function normalizeLabel(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function canUseTld(tld: string, pricingTlds: string[]) {
  if (pricingTlds.length === 0) return true;
  return pricingTlds.includes(tld);
}

type DiscoveredTld = { tld: string; source: "direct" | "stem" | "association" };

function discoverRelevantTlds(words: string[], pricingTlds: string[]): DiscoveredTld[] {
  if (pricingTlds.length === 0) return [];

  const tldSet = new Set(pricingTlds);
  const seen = new Set<string>();
  const results: DiscoveredTld[] = [];

  function add(tld: string, source: DiscoveredTld["source"]) {
    if (seen.has(tld) || !tldSet.has(tld)) return;
    seen.add(tld);
    results.push({ tld, source });
  }

  // Layer 1: Direct match - description word exactly matches a TLD
  for (const word of words) {
    if (word.length >= 3 && tldSet.has(word)) {
      add(word, "direct");
    }
  }

  // Layer 2: Stem match - word stem matches TLD stem
  const wordStems = words
    .filter((w) => w.length >= 4)
    .map((w) => stem(w))
    .filter((s) => s.length >= 4);

  for (const tld of pricingTlds) {
    if (tld.length < 4 || NOISY_STEM_TLDS.has(tld)) continue;
    const tldStem = stem(tld);
    if (tldStem.length < 4) continue;

    for (const ws of wordStems) {
      if (ws === tldStem || tldStem.startsWith(ws) || ws.startsWith(tldStem)) {
        add(tld, "stem");
        break;
      }
    }
  }

  // Layer 3: Association map - semantic links that stemming can't catch
  for (const word of words) {
    const variants = [word, depluralize(word)];
    for (const variant of variants) {
      const associated = TLD_ASSOCIATIONS[variant];
      if (!associated) continue;
      for (const tld of associated) {
        add(tld, "association");
      }
    }
  }

  return results;
}

function stem(word: string) {
  if (word.length < 4) return word;
  return word
    .replace(/(ating|ting|ning|ing)$/, "")
    .replace(/(ation|tion|sion)$/, "")
    .replace(/(ment|ness|ity|ous|ive|able|ible|ful|less|ist|ism|ance|ence)$/, "")
    .replace(/(er|or|ly|al)$/, "")
    .replace(/(.)\1$/, "$1");
}

function depluralize(word: string) {
  if (word.endsWith("ies") && word.length > 4) return word.slice(0, -3) + "y";
  if (word.endsWith("ses") || word.endsWith("xes") || word.endsWith("zes")) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}
