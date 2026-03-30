/**
 * [INPUT]: diary text fragments, circle geometry from ArcReactor, Pretext for layout
 * [OUTPUT]: MatrixRain — canvas text flow using Pretext per-line width around reactor circle
 * [POS]: home/ visual layer behind ArcReactor
 * [PROTOCOL]: update this header on change, then check CLAUDE.md
 */

"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { prepareWithSegments, layoutNextLine } from "@chenglou/pretext";
import type { PreparedTextWithSegments, LayoutCursor } from "@chenglou/pretext";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const FONT_SIZE = 11;
const LINE_HEIGHT = 15;
const SCROLL_SPEED = 0.12;
const CIRCLE_PADDING = 28;
const TEXT_COLOR = "rgba(236, 72, 153, 0.12)";
const BRIGHT_COLOR = "rgba(236, 72, 153, 0.30)";
const BRIGHT_CHANCE = 0.015;
const FONT_SPEC = `${FONT_SIZE}px "Zpix", "Geist Pixel Square", monospace`;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CircleInfo {
  cx: number;
  cy: number;
  r: number;
}

interface Props {
  fragments: string[];
  circle: CircleInfo | null;
}

interface RenderedLine {
  text: string;
  x: number;
  y: number;
  bright: boolean;
}

/* ------------------------------------------------------------------ */
/*  Build lines using Pretext — text flows around circle               */
/* ------------------------------------------------------------------ */

function buildLines(
  prepared: PreparedTextWithSegments,
  containerW: number,
  containerH: number,
  cx: number,
  cy: number,
  r: number,
  yOffset: number
): RenderedLine[] {
  const lines: RenderedLine[] = [];
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
  let y = -yOffset % (containerH * 2);

  while (y < containerH + LINE_HEIGHT) {
    const dy = y - cy;
    const insideCircle = Math.abs(dy) < r;
    const bright = Math.random() < BRIGHT_CHANCE;

    if (insideCircle) {
      const halfChord = Math.sqrt(r * r - dy * dy);
      const circleLeft = cx - halfChord;
      const circleRight = cx + halfChord;
      const leftW = circleLeft - 10;
      const rightW = containerW - circleRight - 10;

      // left side
      if (leftW > 40) {
        const line = layoutNextLine(prepared, cursor, leftW);
        if (!line) { cursor = { segmentIndex: 0, graphemeIndex: 0 }; y += LINE_HEIGHT; continue; }
        lines.push({ text: line.text, x: 4, y, bright });
        cursor = line.end;
      }

      // right side
      if (rightW > 40) {
        const line = layoutNextLine(prepared, cursor, rightW);
        if (!line) { cursor = { segmentIndex: 0, graphemeIndex: 0 }; y += LINE_HEIGHT; continue; }
        lines.push({ text: line.text, x: circleRight + 10, y, bright });
        cursor = line.end;
      }
    } else {
      // full width
      const line = layoutNextLine(prepared, cursor, containerW - 8);
      if (!line) {
        // text exhausted, loop back
        cursor = { segmentIndex: 0, graphemeIndex: 0 };
        y += LINE_HEIGHT;
        continue;
      }
      lines.push({ text: line.text, x: 4, y, bright });
      cursor = line.end;
    }

    y += LINE_HEIGHT;
  }

  return lines;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MatrixRain({ fragments, circle }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offsetRef = useRef(0);
  const preparedRef = useRef<PreparedTextWithSegments | null>(null);
  const [ready, setReady] = useState(false);

  // prepare text once
  useEffect(() => {
    if (fragments.length === 0) return;
    const fullText = fragments.join(" · ");
    // repeat text so we have enough to fill the screen multiple times
    const repeated = (fullText + " · ").repeat(3);
    preparedRef.current = prepareWithSegments(repeated, FONT_SPEC);
    setReady(true);
  }, [fragments]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const prepared = preparedRef.current;
    if (!canvas || !prepared) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, w, h);

    const cx = circle ? circle.cx : w / 2;
    const cy = circle ? circle.cy : h / 2;
    const r = circle ? circle.r + CIRCLE_PADDING : Math.min(w, h) * 0.25;

    ctx.font = FONT_SPEC;
    ctx.textBaseline = "top";

    const lines = buildLines(prepared, w, h, cx, cy, r, offsetRef.current);

    for (const line of lines) {
      if (line.y < -LINE_HEIGHT || line.y > h + LINE_HEIGHT) continue;

      const fadeTop = Math.max(0, Math.min(1, line.y / 60));
      const fadeBottom = Math.max(0, Math.min(1, (h - line.y) / 60));
      ctx.globalAlpha = Math.min(fadeTop, fadeBottom);
      ctx.fillStyle = line.bright ? BRIGHT_COLOR : TEXT_COLOR;
      ctx.fillText(line.text, line.x, line.y);
    }

    ctx.globalAlpha = 1;
    offsetRef.current += SCROLL_SPEED;
  }, [circle, ready]);

  useEffect(() => {
    if (!ready) return;
    let rafId: number;
    function loop() {
      draw();
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [draw, ready]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
