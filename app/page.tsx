"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectName.trim()) return;

    const params = new URLSearchParams();
    params.set("q", projectName.trim());
    if (description.trim()) params.set("d", description.trim());
    router.push(`/search?${params.toString()}`);
  }

  return (
    <main className="mx-auto grid min-h-screen w-[min(1180px,calc(100%-32px))] items-center py-8 max-[580px]:w-[min(100%-22px,1180px)]">
      <header className="grid min-h-[calc(100vh-64px)] items-center gap-8 [grid-template-columns:minmax(0,_0.95fr)_minmax(380px,_0.78fr)] max-[860px]:grid-cols-1">
        <div className="min-w-0">
          <p className="mb-2 text-[0.76rem] font-bold uppercase tracking-[0.02em] text-vermillion">
            Porkbun first
          </p>
          <h1 className="m-0 font-display text-[clamp(2.5rem,8vw,5.5rem)] font-extrabold leading-[0.92] tracking-[-0.025em] text-ink [overflow-wrap:anywhere] [text-wrap:balance]">
            Domain Finder
          </h1>
          <p className="mt-3 max-w-[65ch] text-[1rem] leading-[1.55] text-ink-secondary [overflow-wrap:anywhere] [text-wrap:pretty]">
            Generate smart project domains, product-name fallbacks, relevant
            TLDs, and compact hacks like{" "}
            <strong className="text-ink">datafa.st</strong>.
          </p>
        </div>

        {/* Search panel */}
        <section
          className="rounded-lg border border-border bg-white p-5 max-[580px]:p-4"
          aria-label="Domain search"
        >
          <form className="grid gap-4" onSubmit={handleSearch}>
            <div className="grid gap-2">
              <label
                className="text-sm font-bold text-ink"
                htmlFor="projectName"
              >
                Project name
              </label>
              <div className="flex h-[46px] w-full items-center gap-2.5 rounded-md border border-border bg-white px-3 text-ink transition-colors duration-150 focus-within:border-cobalt focus-within:ring-[3px] focus-within:ring-cobalt/15">
                <Search
                  className="shrink-0 text-ink-secondary"
                  size={18}
                  aria-hidden="true"
                />
                <input
                  className="h-[42px] w-full min-w-0 border-0 bg-transparent text-ink outline-none placeholder:text-ink-secondary"
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Acme Studio"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label
                className="text-sm font-bold text-ink"
                htmlFor="description"
              >
                Description
              </label>
              <textarea
                className="min-h-[92px] w-full resize-y rounded-md border border-border bg-white px-3 py-3 text-ink outline-none transition-colors duration-150 placeholder:text-ink-secondary focus:border-cobalt focus:ring-[3px] focus:ring-cobalt/15"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A video collaboration app for fast-moving creative teams."
                rows={3}
              />
            </div>

            <button
              className="inline-flex min-h-10 min-w-[132px] items-center justify-center gap-2 rounded-md border border-vermillion bg-vermillion px-5 font-bold text-white transition-colors duration-150 hover:border-vermillion-hover hover:bg-vermillion-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-cobalt/15 disabled:cursor-not-allowed disabled:opacity-70 max-[860px]:w-full"
              type="submit"
              disabled={!projectName.trim()}
            >
              <Search size={18} aria-hidden="true" />
              Search
            </button>
          </form>
        </section>
      </header>
    </main>
  );
}
