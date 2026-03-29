/**
 * [INPUT]: @/lib/content (Entry type), next/link
 * [OUTPUT]: EntryPage — full single-entry view with rendered markdown body
 * [POS]: components/content/ shared renderer, consumed by diary/[slug] and weekly/[slug]
 * [PROTOCOL]: update this header on change, then check CLAUDE.md
 */

import Link from "next/link";
import type { Entry } from "@/lib/content";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface EntryPageProps {
  entry: Entry;
  type: "diary" | "weekly";
  backHref: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EntryPage({ entry, type, backHref }: EntryPageProps) {
  return (
    <div className="min-h-screen bg-bg-dark">
      <article className="mx-auto max-w-2xl px-6 py-16">
        {/* -- nav --------------------------------------------------- */}
        <Link
          href={backHref}
          className="mb-8 inline-block font-vt323 text-sm tracking-widest text-neon-pink opacity-60 hover:opacity-100 transition-opacity"
        >
          &larr; BACK TO {type === "diary" ? "DIARY" : "WEEKLY"}
        </Link>

        {/* -- meta -------------------------------------------------- */}
        <header className="mb-8">
          <time className="font-vt323 text-xs tracking-widest text-neon-coral opacity-70">
            {entry.date}
          </time>
          <h1 className="mt-2 font-vt323 text-2xl tracking-widest text-pink-text">
            {entry.title}
          </h1>
        </header>

        {/* -- body -------------------------------------------------- */}
        <div
          className="diary-content"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
      </article>
    </div>
  );
}
