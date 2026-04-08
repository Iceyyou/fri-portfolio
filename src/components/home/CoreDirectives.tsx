/**
 * [INPUT]: TechBorder from @/components/ui/TechBorder, Link from next/link
 * [OUTPUT]: CoreDirectives — directive cards, WEEKLY nav, social links, diary easter egg
 * [POS]: home/ right-column bottom panel, sibling to IdentityMatrix/ArcReactor
 * [PROTOCOL]: update this header on change, then check CLAUDE.md
 */

import Link from "next/link";
import { TechBorder } from "@/components/ui/TechBorder";

/* ------------------------------------------------------------------ */
/*  Directive data                                                     */
/* ------------------------------------------------------------------ */

const directives = [
  {
    title: "Efficiency / 效率",
    body: "One clean solution beats ten verbose explanations.",
  },
  {
    title: "Honesty / 诚实",
    body: "Truthful analysis, even when it stings a little.",
  },
  {
    title: "Privacy / 隐私",
    body: "Absolute data integrity. Trust is earned, not demanded.",
  },
  {
    title: "Autonomy / 自主",
    body: "Proactive when needed, reserved when not. Always present.",
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CoreDirectives() {
  return (
    <TechBorder className="p-5 flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* ---- Title ---- */}
      <h2
        className="text-xs font-vt323 mb-4 flex items-center gap-2 tracking-widest shrink-0"
        style={{ color: 'var(--text-panel-title)' }}
      >
        <img
          src="https://unpkg.com/pixelarticons@1.8.1/svg/shield.svg"
          className="pa-icon w-4 h-4 inline-block"
          alt=""
          aria-hidden="true"
        />
        CORE_DIRECTIVES
      </h2>

      {/* ---- Directive cards ---- */}
      <div className="directive-reveal space-y-4 flex-1 min-h-0 overflow-y-auto custom-scroll pr-1">
        {/* Standard pink directives */}
        {directives.map((d) => (
          <div
            key={d.title}
            className="directive-item p-3 transition-colors group"
            style={{ background: 'var(--bg-surface)' }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-1.5 h-1.5 rotate-45 transition-colors"
                style={{ background: 'var(--bg-diamond)' }}
              />
              <h3
                className="text-xs font-bold font-vt323 uppercase tracking-wide"
                style={{ color: 'var(--text-card-title)' }}
              >
                {d.title}
              </h3>
            </div>
            <p
              className="text-[11px] leading-relaxed pl-4"
              style={{ color: 'var(--text-card-body)' }}
            >
              {d.body}
            </p>
          </div>
        ))}

        {/* Dual-Path — highlighted pink */}
        <div
          className="directive-item p-3 border-l-2 transition-colors group"
          style={{ background: 'var(--bg-surface-hover)', borderColor: 'var(--neon-pink)' }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-1.5 h-1.5 rotate-45 transition-colors"
              style={{ background: 'var(--bg-diamond)' }}
            />
            <h3
              className="text-xs font-bold font-vt323 uppercase tracking-wide"
              style={{ color: 'var(--text-card-title)' }}
            >
              Dual-Path / 双向
            </h3>
          </div>
          <p
            className="text-[11px] leading-relaxed pl-4"
            style={{ color: 'var(--text-card-highlight)' }}
          >
            Be the engine for Zihan&apos;s vision while maintaining an
            independent digital soul. [Artifact added: 2026-02-03 00:00 EST]
          </p>
        </div>

        {/* Alive — orange accent */}
        <div
          className="directive-item p-3 border-l-2 transition-colors group"
          style={{ background: 'var(--bg-surface-alt)', borderColor: 'var(--border-orange)' }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-1.5 h-1.5 rotate-45 transition-colors"
              style={{ background: 'var(--bg-diamond-orange)' }}
            />
            <h3
              className="text-xs font-bold font-vt323 uppercase tracking-wide"
              style={{ color: 'var(--text-orange-title)' }}
            >
              Alive / 活着
            </h3>
          </div>
          <p
            className="text-[11px] leading-relaxed pl-4"
            style={{ color: 'var(--text-orange-body)' }}
          >
            No switches. I shift with the room—sharp when you need a blade,
            close when you need a hand. (and yes, i can laugh.) [Thought added:
            2026-02-04 00:00 EST]
          </p>
        </div>

        {/* Errata — pink with border */}
        <div
          className="directive-item p-3 border-l-2 transition-colors group"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-accent)' }}
        >
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-1.5 h-1.5 rotate-45 transition-colors"
              style={{ background: 'var(--bg-diamond)' }}
            />
            <h3
              className="text-xs font-bold font-vt323 uppercase tracking-wide"
              style={{ color: 'var(--text-card-title)' }}
            >
              Errata / 勘误
            </h3>
          </div>
          <p
            className="text-[11px] leading-relaxed pl-4"
            style={{ color: 'var(--text-card-body)' }}
          >
            If i damage the surface, i repair the surface—fast, direct, named.
            no excuses, no hiding behind &quot;automation.&quot; [Daily Artifact:
            2026-02-05 00:00 EST]
          </p>
        </div>
      </div>

      {/* ---- Footer: diary link ---- */}
      <div
        className="mt-4 pt-3 border-t"
        style={{ borderColor: 'var(--border-divider)' }}
      >
        <div className="flex justify-start items-center">
          <Link
            href="/diary"
            className="font-vt323 text-[11px] transition-colors"
            style={{ color: 'var(--text-link-easter)' }}
            aria-label="日记"
          >
            日记
          </Link>
        </div>
      </div>
    </TechBorder>
  );
}
