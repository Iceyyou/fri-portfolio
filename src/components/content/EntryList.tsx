/**
 * [INPUT]: @/lib/content (Entry type), next/link
 * [OUTPUT]: EntryList — chronological list of content entries with title, date, summary
 * [POS]: components/content/ shared renderer, consumed by diary/page.tsx and weekly/page.tsx
 * [PROTOCOL]: update this header on change, then check CLAUDE.md
 */

import Link from "next/link";
import type { Entry } from "@/lib/content";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface EntryListProps {
  entries: Entry[];
  type: "diary" | "weekly";
  title: string;
  subtitle: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EntryList({ entries, type, title, subtitle }: EntryListProps) {
  return (
    <div className="min-h-screen bg-bg-dark">
      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* -- header ------------------------------------------------ */}
        <header className="mb-12">
          <Link
            href="/"
            className="mb-6 inline-block font-vt323 text-sm tracking-widest text-neon-pink opacity-60 hover:opacity-100 transition-opacity"
          >
            &larr; BACK TO FRI
          </Link>
          <h1 className="font-vt323 text-3xl tracking-widest text-pink-text">
            {title}
          </h1>
          <p className="mt-2 text-sm text-gray-400">{subtitle}</p>
        </header>

        {/* -- entries ----------------------------------------------- */}
        <ul className="space-y-6">
          {entries.map((entry) => (
            <li key={entry.slug}>
              <Link
                href={`/${type}/${entry.slug}`}
                className="group block rounded-sm border border-transparent p-4 transition-all hover:border-glass-border hover:bg-glass-bg"
              >
                <time className="font-vt323 text-xs tracking-widest text-neon-coral opacity-70">
                  {entry.date}
                </time>
                <h2 className="mt-1 font-vt323 text-lg tracking-wide text-pink-text group-hover:text-neon-pink transition-colors">
                  {entry.title}
                </h2>
                {entry.summary && (
                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                    {entry.summary}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>

        {entries.length === 0 && (
          <p className="font-vt323 text-sm text-gray-500 tracking-widest">
            NO ENTRIES YET.
          </p>
        )}
      </div>
    </div>
  );
}
