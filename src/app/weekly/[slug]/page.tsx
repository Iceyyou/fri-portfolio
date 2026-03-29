/**
 * [INPUT]:  @/lib/content (getEntry, getSlugs), @/components/content/EntryPage
 * [OUTPUT]: Single weekly entry page — SSG at /weekly/[slug]
 * [POS]:    app/weekly/[slug]/ route — renders one weekly entry by slug,
 *           generateStaticParams pre-builds all weekly pages at build time
 * [PROTOCOL]: update this header on change, then check CLAUDE.md
 */

import { getEntry, getSlugs } from "@/lib/content";
import { EntryPage } from "@/components/content/EntryPage";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const slugs = await getSlugs("weekly");
  return slugs.map((slug) => ({ slug }));
}

export default async function WeeklyEntryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await getEntry("weekly", slug);
  if (!entry) notFound();
  return <EntryPage entry={entry} type="weekly" backHref="/weekly" />;
}
