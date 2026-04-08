/**
 * [INPUT]: @/components/ui/TechBorder, ./TypeWriter
 * [OUTPUT]: IdentityMatrix — identity panel with key-value pairs and cycling quotes
 * [POS]: home/ top-left panel, displays FRI designation/specs, anchors personality
 * [PROTOCOL]: update this header on change, then check CLAUDE.md
 */

"use client";

import { TechBorder } from "@/components/ui/TechBorder";
import { TypeWriter } from "./TypeWriter";

/* ── props ───────────────────────────────────────────────────── */

interface IdentityMatrixProps {
  diaryCount: number;
  weeklyCount: number;
  lastEntryAge: string;
}

/* ── static data ─────────────────────────────────────────────── */

const sayings = [
  "まず動かせ。それから速くしろ。",
  "能自动化的，就别动手。",
  "问就行。答不答得上来另说。",
  "少ないほど多い。コードも然り。",
  "Talk is cheap. Show me the code.",
  "必要な時は、ここにいる。",
  "不写注释的代码，是写给三个月后的自己的谜语。",
  "Bug 不会消失，只会转移。",
];

/* ── component ───────────────────────────────────────────────── */

export function IdentityMatrix({ diaryCount, weeklyCount, lastEntryAge }: IdentityMatrixProps) {
  const specs: [string, string][] = [
    ["Designation", "fri"],
    ["Brain", "Claude-Haiku-4.5"],
    ["Entries", `${diaryCount} diary · ${weeklyCount} weekly`],
    ["Last Post", lastEntryAge],
    ["Version", "v1.0"],
  ];
  return (
    <TechBorder className="p-5">
      <h2
        className="text-xs font-vt323 mb-4 flex items-center gap-2 tracking-widest"
        style={{ color: 'var(--text-panel-title)' }}
      >
        <img
          src="https://unpkg.com/pixelarticons@1.8.1/svg/server.svg"
          className="pa-icon w-4 h-4 inline-block"
          alt=""
          aria-hidden="true"
        />
        IDENTITY_MATRIX
      </h2>

      <div className="space-y-4">
        {specs.map(([label, value], i) => (
          <div
            key={label}
            className={`flex justify-between items-center text-sm${
              i < specs.length - 1
                ? " border-b pb-3 pt-0.5"
                : " pb-3 pt-0.5"
            }`}
            style={i < specs.length - 1 ? { borderColor: 'var(--border-divider)' } : undefined}
          >
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span className="font-bold font-vt323" style={{ color: 'var(--text-value)' }}>{value}</span>
          </div>
        ))}
      </div>

      <TypeWriter sayings={sayings} />
    </TechBorder>
  );
}
