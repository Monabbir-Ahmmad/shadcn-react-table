import React, { useContext } from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { accentRuns, clamp, ThemeContext } from "./theme";

/**
 * Words that punch in one by one (spring scale, fade, blur to sharp). `**accent**` runs are drawn
 * in the brand colour with a bar sweeping under them once they land. `frame` is local to the
 * entrance; `exit` (0..1) carries the words up and out.
 */
export const KineticText: React.FC<{
  text: string;
  frame: number;
  exit?: number;
  fontSize: number;
  color?: string;
  weight?: number;
  stagger?: number;
  lineHeight?: number;
  letterSpacing?: string;
}> = ({
  text,
  frame,
  exit = 0,
  fontSize,
  color = "#fff",
  weight = 700,
  stagger = 3,
  lineHeight = 1.08,
  letterSpacing = "-0.035em",
}) => {
  const { brand, fonts } = useContext(ThemeContext);
  const { fps } = useVideoConfig();
  let index = 0;

  const word = (w: string, key: string, accent: boolean) => {
    const i = index++;
    const s = spring({
      frame: frame - i * stagger,
      fps,
      config: { damping: 12, stiffness: 190, mass: 0.7 },
    });
    const opacity =
      interpolate(s, [0, 0.55], [0, 1], clamp) * (1 - exit);
    const blur = Math.max(0, 1 - s) * 16 + exit * 10;
    return (
      <span
        key={key}
        style={{
          display: "inline-block",
          opacity,
          scale: String(interpolate(s, [0, 1], [1.38, 1])),
          translate: `0px ${(1 - Math.min(s, 1)) * 0.18 * fontSize - exit * 0.32 * fontSize}px`,
          filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
          color: accent ? `rgb(${brand})` : color,
          textShadow: accent ? `0 0 42px rgba(${brand}, 0.35)` : undefined,
        }}
      >
        {w}
      </span>
    );
  };

  const nodes: React.ReactNode[] = [];
  accentRuns(text).forEach((run, ri) => {
    const parts = run.text.split(/(\s+)/).filter((p) => p.length > 0);
    if (!run.accent) {
      parts.forEach((p, pi) =>
        nodes.push(/^\s+$/.test(p) ? " " : word(p, `${ri}-${pi}`, false)),
      );
      return;
    }
    const first = index;
    const inner = parts.map((p, pi) =>
      /^\s+$/.test(p) ? " " : word(p, `${ri}-${pi}`, true),
    );
    const last = index - 1;
    const bar = spring({
      frame: frame - (last * stagger + 7),
      fps,
      config: { damping: 200 },
      durationInFrames: 14,
    });
    nodes.push(
      <span
        key={`a${ri}-${first}`}
        style={{ display: "inline-block", position: "relative", whiteSpace: "nowrap" }}
      >
        {inner}
        <span
          style={{
            position: "absolute",
            left: "0.02em",
            right: "0.02em",
            bottom: "-0.04em",
            height: "0.085em",
            borderRadius: 999,
            backgroundColor: `rgb(${brand})`,
            boxShadow: `0 0 24px rgba(${brand}, 0.55)`,
            transformOrigin: exit > 0 ? "right center" : "left center",
            scale: `${bar * (1 - exit)} 1`,
          }}
        />
      </span>,
    );
  });

  return (
    <span
      style={{
        fontFamily: fonts.heading,
        fontWeight: weight,
        fontSize,
        lineHeight,
        letterSpacing,
        color,
      }}
    >
      {nodes}
    </span>
  );
};
