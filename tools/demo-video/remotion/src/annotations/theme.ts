// Theme context and shared shapes for the annotation kit (project addition). Demo.tsx provides
// the theme from timeline.json; every overlay reads its brand colour and fonts from here.
import React, { createContext } from "react";

/** From demo.config.json, written into every timeline by prepare.mjs. */
export type Theme = {
  /** "r, g, b" */
  brand: string;
  ink: string;
  fonts: { heading: string; body: string; mono: string };
  fontFiles: { role: string; family: string; weight: number; file: string }[];
  eyebrow: string;
  footer: string;
};

export const DEFAULT_THEME: Theme = {
  brand: "163, 230, 53",
  ink: "#0a0a0a",
  fonts: { heading: "sans-serif", body: "sans-serif", mono: "monospace" },
  fontFiles: [],
  eyebrow: "",
  footer: "",
};

export const ThemeContext = createContext<Theme>(DEFAULT_THEME);

/** The camera of one output frame: source px -> output px is (v - x0) * k. */
export type Camera = { x0: number; y0: number; k: number };
/** A box in source px (page CSS px x the take's pixel density). */
export type Box = { x: number; y: number; w: number; h: number };

export const toScreen = (b: Box, c: Camera): Box => ({
  x: (b.x - c.x0) * c.k,
  y: (b.y - c.y0) * c.k,
  w: b.w * c.k,
  h: b.h * c.k,
});

type Span = { from: number; exitAt: number; to: number };

export type HeadlineSpan = Span & {
  kind: "headline";
  text: string;
  dim: boolean;
  position: "center" | "top" | "bottom";
};
export type StatSpan = Span & {
  kind: "stat";
  value: number;
  label: string;
  prefix: string;
  suffix: string;
  dim: boolean;
  at: Corner | "center";
};
export type CalloutSpan = Span & {
  kind: "callout";
  text: string;
  box: Box;
  side: Side | null;
};
export type BubbleSpan = Span & {
  kind: "bubble";
  text: string;
  box: Box | null;
  side: Side | null;
  /** Frames after `from` when the words start lighting up, and how long they take. */
  speakAt: number;
  speakFrames: number;
};
export type SpotlightSpan = Span & {
  kind: "spotlight";
  box: Box;
  pad: number;
  fromBox: Box | null;
  continues: boolean;
};
export type KeysSpan = Span & {
  kind: "keys";
  keys: string[];
  x: number;
  y: number;
};
export type CodeSpan = Span & {
  kind: "code";
  text: string;
  at: Corner;
  swapIn: boolean;
  typeFrames: number;
};
export type Annotation =
  | HeadlineSpan
  | StatSpan
  | CalloutSpan
  | BubbleSpan
  | SpotlightSpan
  | KeysSpan
  | CodeSpan;

export type Side = "top" | "bottom" | "left" | "right";
export type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

/** The end card content a scene can set (`end:` in a step list, r.end() in code). */
export type EndCardSpec = {
  title?: string;
  command?: string;
  links?: string[];
  footer?: string;
};

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Dark glass surface with a hairline border and a faint brand glow. */
export const glass = (brand: string, glow = 0.16): React.CSSProperties => ({
  background:
    "linear-gradient(180deg, rgba(24,26,30,0.86) 0%, rgba(12,13,16,0.9) 100%)",
  border: "1px solid rgba(255,255,255,0.09)",
  boxShadow: [
    "inset 0 1px 0 rgba(255,255,255,0.07)",
    "0 24px 60px rgba(0,0,0,0.42)",
    "0 6px 16px rgba(0,0,0,0.28)",
    `0 0 0 1px rgba(${brand}, ${glow * 0.9})`,
    `0 0 48px rgba(${brand}, ${glow})`,
  ].join(", "),
  backdropFilter: "blur(18px) saturate(1.4)",
});

export type Run = { text: string; accent: boolean };
/** "Built for **big data**" -> runs of plain and accent text. */
export const accentRuns = (text: string): Run[] =>
  text
    .split(/(\*\*[^*]+\*\*)/)
    .filter((s) => s.length > 0)
    .map((s) =>
      s.indexOf("**") === 0
        ? { text: s.slice(2, -2), accent: true }
        : { text: s, accent: false },
    );
export const stripAccents = (text: string) => text.replace(/\*\*/g, "");
