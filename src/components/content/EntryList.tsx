/**
 * [INPUT]: @/lib/content (Entry type), next/link
 * [OUTPUT]: EntryList — card-based list of content entries with glass panels
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
  const latest = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* scanline effect */}
      <div className="scanline-overlay" />

      <div className="mx-auto max-w-4xl px-5 py-12">
        {/* -- header ------------------------------------------------ */}
        <header className="mb-10">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 font-vt323 text-xs tracking-widest text-neon-coral/70 hover:text-neon-coral transition-colors"
          >
            <img
              src="https://unpkg.com/pixelarticons@1.8.1/svg/arrow-left.svg"
              className="pa-icon w-3 h-3"
              alt=""
              aria-hidden="true"
            />
            BACK TO FRI
          </Link>
          <h1 className="font-vt323 text-3xl sm:text-4xl tracking-wider text-pink-200">
            {title}
          </h1>
          <p className="mt-2 text-sm text-gray-400 max-w-prose leading-relaxed">
            {subtitle}
          </p>
          <div className="mt-4 h-px bg-gradient-to-r from-neon-pink/40 via-neon-pink/10 to-transparent" />
        </header>

        {/* -- featured / latest ------------------------------------- */}
        {latest.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="font-vt323 text-xs tracking-widest text-neon-pink/60">
                LATEST
              </span>
              <div className="flex-1 h-px bg-neon-pink/15" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {latest.map((entry, i) => (
                <Link
                  key={entry.slug}
                  href={`/${type}/${entry.slug}`}
                  className="group glass-panel rounded-sm p-5 flex flex-col justify-between min-h-[160px] hover:border-neon-pink/50 transition-all"
                >
                  <div>
                    <time className="font-vt323 text-[11px] tracking-widest text-neon-coral/80">
                      {entry.date}
                    </time>
                    <h2 className="mt-2 font-vt323 text-xl tracking-wide text-pink-200 group-hover:text-white transition-colors leading-tight">
                      {entry.title}
                    </h2>
                    {entry.summary && (
                      <p className="mt-2 text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {entry.summary}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-tech text-neon-pink/40 group-hover:text-neon-pink/70 transition-colors">
                      {i === 0 ? "NEW" : `#${entries.length - i}`}
                    </span>
                    <img
                      src="https://unpkg.com/pixelarticons@1.8.1/svg/arrow-right.svg"
                      className="pa-icon w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                      alt=""
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* -- archive list ------------------------------------------ */}
        {rest.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span className="font-vt323 text-xs tracking-widest text-neon-pink/60">
                ARCHIVE
              </span>
              <div className="flex-1 h-px bg-neon-pink/15" />
              <span className="font-tech text-[10px] text-gray-500">
                {entries.length} entries
              </span>
            </div>

            <div className="space-y-1">
              {rest.map((entry, i) => (
                <Link
                  key={entry.slug}
                  href={`/${type}/${entry.slug}`}
                  className="group flex items-baseline gap-4 py-3 px-4 rounded-sm transition-all hover:bg-glass-bg border border-transparent hover:border-glass-border"
                >
                  <time className="font-vt323 text-[11px] tracking-widest text-neon-coral/50 shrink-0 w-20">
                    {entry.date}
                  </time>
                  <h3 className="font-vt323 text-sm tracking-wide text-pink-200/80 group-hover:text-white transition-colors flex-1 truncate">
                    {entry.title}
                  </h3>
                  <span className="font-tech text-[9px] text-gray-600 shrink-0">
                    #{entries.length - 3 - i}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {entries.length === 0 && (
          <div className="glass-panel rounded-sm p-10 text-center">
            <p className="font-vt323 text-sm text-gray-500 tracking-widest">
              NO ENTRIES YET — AWAITING FIRST DISPATCH.
            </p>
          </div>
        )}

        {/* -- footer ------------------------------------------------ */}
        <footer className="mt-12 pt-6 border-t border-neon-pink/10">
          <p className="text-[10px] text-gray-600 font-tech">
            {entries.length} entries · powered by FRI
          </p>
        </footer>
      </div>
    </div>
  );
}
