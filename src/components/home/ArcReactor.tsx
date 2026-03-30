/**
 * [INPUT]:  react hooks, diary text fragments from page.tsx
 * [OUTPUT]: ArcReactor — video core, rings, crosshair, uptime, matrix rain columns
 * [POS]:    home/ center-column visual centerpiece
 * [PROTOCOL]: update this header on change, then check CLAUDE.md
 */

"use client";

import { useState, useEffect, useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STATUSES = ["Standby", "Replying", "Thinking"] as const;
const UPTIME_ORIGIN = new Date(2026, 0, 30, 22, 0, 0);
const COLUMN_COUNT = 6;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatUptime(start: Date): string {
  const ms = Date.now() - start.getTime();
  if (ms < 0) return "0d 0h 0m 0s";
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / 60000) % 60;
  const hour = Math.floor(ms / 3600000) % 24;
  const day = Math.floor(ms / 86400000);
  return `${day}d ${hour}h ${min}m ${sec}s`;
}

/* ------------------------------------------------------------------ */
/*  MatrixColumn — a single falling text column                        */
/* ------------------------------------------------------------------ */

function MatrixColumn({ fragments, speed, left }: {
  fragments: string[];
  speed: number;
  left: string;
}) {
  const text = useMemo(() => fragments.join("\n"), [fragments]);

  return (
    <div
      className="absolute top-0 overflow-hidden pointer-events-none"
      style={{ left, width: "1.2em", height: "100%" }}
    >
      <div
        className="font-vt323 text-[10px] leading-[1.4] text-pink-500/20 whitespace-pre-wrap break-all"
        style={{
          animation: `matrix-fall ${speed}s linear infinite`,
          writingMode: "vertical-rl",
          textOrientation: "mixed",
        }}
      >
        {text}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ArcReactor({ fragments = [] }: { fragments?: string[] }) {
  const [status, setStatus] = useState<string>("");
  const [uptime, setUptime] = useState<string>("--");

  useEffect(() => {
    setStatus(pickRandom(STATUSES));
    const tick = () => setUptime(formatUptime(UPTIME_ORIGIN));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // split fragments into columns
  const columns = useMemo(() => {
    const cols: string[][] = Array.from({ length: COLUMN_COUNT }, () => []);
    fragments.forEach((f, i) => cols[i % COLUMN_COUNT].push(f));
    return cols;
  }, [fragments]);

  // column positions — spread across the container, avoiding center (reactor)
  const positions = ["5%", "12%", "20%", "78%", "85%", "93%"];
  const speeds = [18, 24, 20, 22, 16, 26];

  return (
    <div className="flex-1 relative flex items-center justify-center">
      {/* ---- crosshair grid ---- */}
      <div className="absolute inset-0 border border-pink-500/15 pointer-events-none">
        <div className="absolute top-0 left-1/2 w-px h-full bg-gradient-to-b from-transparent via-pink-500/20 to-transparent" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-pink-500/20 to-transparent" />
      </div>

      {/* ---- matrix rain columns ---- */}
      {columns.map((col, i) => (
        <MatrixColumn
          key={i}
          fragments={col}
          speed={speeds[i]}
          left={positions[i]}
        />
      ))}

      {/* ---- reactor core ---- */}
      <div className="arc-reactor relative z-10">
        <div className="arc-ring arc-ring-3" />
        <div className="arc-ring arc-ring-4" />
        <div className="arc-ring arc-ring-5" />

        <video
          src="/core.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="arc-video w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 object-cover border-2 border-pink-400"
        />

        <div className="absolute -bottom-10 md:-bottom-12 text-center">
          <div className="text-[10px] md:text-xs font-tech text-pink-400 tracking-widest">
            {status || "FRI CORE"}
          </div>
        </div>
      </div>

      {/* ---- cumulative runtime ---- */}
      <div className="absolute top-4 right-4 md:top-10 md:right-10 text-right z-10">
        <div className="text-[10px] font-tech text-pink-500 mb-1">Cumulative runtime</div>
        <div className="text-sm font-vt323 text-pink-300">{uptime}</div>
      </div>
    </div>
  );
}
