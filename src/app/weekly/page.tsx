/**
 * [INPUT]:  @/lib/content (getEntries), @/components/content/EntryList
 * [OUTPUT]: Weekly list page — SSG at /weekly
 * [POS]:    app/weekly/ route — renders all weekly entries as a chronological list
 * [PROTOCOL]: update this header on change, then check CLAUDE.md
 */

import { getEntries } from "@/lib/content";
import { EntryList } from "@/components/content/EntryList";

export default async function WeeklyPage() {
  const entries = await getEntries("weekly");
  return (
    <EntryList
      entries={entries}
      type="weekly"
      title="Weekly Dispatch"
      subtitle="Design engineering notes, tools, and observations."
    />
  );
}
