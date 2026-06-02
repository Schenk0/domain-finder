import { cx, KNOWN_PREFIXES, ADDED_SUFFIXES, type Result } from "../types";

export function DomainParts({ result }: { result: Result }) {
  const { candidate } = result;
  const parts = splitSld(candidate);

  return (
    <span
      className="inline-flex flex-wrap items-baseline [font-variant-ligatures:none]"
      aria-label={candidate.domain}
    >
      {parts.map((part) => (
        <span
          className={cx(
            part.role === "base" && "text-ink",
            part.role === "prefix" && "text-cobalt",
            part.role === "suffix" && "text-cobalt",
            part.role === "hack" && "text-vermillion"
          )}
          key={`${part.role}-${part.text}`}
        >
          {part.text}
        </span>
      ))}
      <span className="text-ink-secondary">.</span>
      <span className="text-available">{candidate.tld}</span>
    </span>
  );
}

function splitSld(candidate: Result["candidate"]) {
  const sld = candidate.sld;

  const matchedPrefix = KNOWN_PREFIXES.find(
    (p) => candidate.kind === "prefix" && sld.startsWith(p) && sld.length > p.length
  );
  if (matchedPrefix) {
    return [
      { role: "prefix" as const, text: matchedPrefix },
      { role: "base" as const, text: sld.slice(matchedPrefix.length) },
    ];
  }

  const suffix = ADDED_SUFFIXES.find(
    (s) => sld.endsWith(s) && sld.length > s.length
  );
  if (suffix && ["app-suffix", "brandable", "category"].includes(candidate.kind)) {
    return [
      { role: "base" as const, text: sld.slice(0, -suffix.length) },
      { role: "suffix" as const, text: suffix },
    ];
  }

  return [
    {
      role: (candidate.kind === "domain-hack" ? "hack" : "base") as
        | "hack"
        | "base",
      text: sld,
    },
  ];
}
