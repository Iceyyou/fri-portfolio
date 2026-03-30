/**
 * [INPUT]:  react useState/useEffect for NYC clock; props totalEntries, totalWords, daysSinceLaunch
 * [OUTPUT]: SystemHeader — top bar with logo, status, POSTS/WORDS gauges, NYC clock
 * [POS]:    home/ layout header, first visual element on the homepage
 * [PROTOCOL]: update this header on change, then check CLAUDE.md
 */

"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SystemHeaderProps {
  totalEntries: number;
  totalWords: number;
  daysSinceLaunch: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const clockFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SystemHeader({ totalEntries, totalWords }: SystemHeaderProps) {
  const [clock, setClock] = useState("");

  /* --- NYC clock (1 s) --- */
  useEffect(() => {
    const tick = () => setClock(clockFmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const entriesPct = Math.min(100, totalEntries);
  const wordsPct = Math.min(100, Math.round(totalWords / 500));

  return (
    <header className="flex-none min-h-14 md:h-16 border-b backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-50" style={{ borderColor: 'var(--border-accent)', backgroundColor: 'var(--header-bg)' }}>
      {/* --- Left: logo + subtitle --- */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-thin font-workbench tracking-widest truncate">
            Friday
          </h1>
          <p className="text-[9px] md:text-[10px] font-tech tracking-[0.15em] md:tracking-[0.2em]" style={{ color: 'var(--text-accent-soft)' }}>
            INTELLIGENT ASSISTANT V3.28
          </p>
        </div>
      </div>

      {/* --- Right: status / gauges / clock / theme --- */}
      <div className="flex items-center gap-3 md:gap-12 font-tech text-[10px] md:text-xs shrink-0" style={{ color: 'var(--text-accent-soft)' }}>
        {/* status dot */}
        <div className="flex items-center gap-2">
          <span className="status-dot w-2 h-2 animate-pulse shrink-0" style={{ background: 'var(--text-status)' }} />
          <span className="hidden sm:inline">SYSTEM ONLINE</span>
        </div>

        {/* POSTS gauge */}
        <div className="hidden sm:flex flex-col items-end">
          <span>POSTS: {totalEntries}</span>
          <div className="w-24 h-1 mt-1" style={{ background: 'var(--gauge-track)' }}>
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${entriesPct}%`, background: 'var(--gauge-fill)' }}
            />
          </div>
        </div>

        {/* WORDS gauge */}
        <div className="hidden sm:flex flex-col items-end">
          <span>WORDS: {(totalWords / 1000).toFixed(1)}k</span>
          <div className="w-24 h-1 mt-1" style={{ background: 'var(--gauge-track)' }}>
            <div
              className="h-full transition-all duration-700"
              style={{ width: `${wordsPct}%`, background: 'var(--gauge-fill)' }}
            />
          </div>
        </div>

        {/* theme toggle */}
        <ThemeToggle />

        {/* NYC clock */}
        <div className="text-right">
          <div className="text-base md:text-lg font-bold font-vt323" style={{ color: 'var(--text-primary)' }}>
            {clock}
          </div>
          <div className="text-[9px] md:text-[10px] opacity-60">
            EST [NEW YORK]
          </div>
        </div>
      </div>
    </header>
  );
}
