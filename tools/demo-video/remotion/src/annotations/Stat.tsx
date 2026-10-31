import React, { useContext } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useVideoConfig } from "remotion";
import { Dim, exitOf } from "./Headline";
import { clamp, StatSpan, ThemeContext } from "./theme";

const decimalsOf = (v: number) => {
  const s = String(v);
  const dot = s.indexOf(".");
  return dot < 0 ? 0 : s.length - dot - 1;
};

/** 100000 -> "100,000" (fixed en-US grouping, so renders match on every machine). */
const group = (v: number, decimals: number) => {
  const [int, frac] = v.toFixed(decimals).split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return frac ? `${grouped}.${frac}` : grouped;
};

/** A big number that counts up (eased) with a label under it. */
export const Stat: React.FC<{ a: StatSpan; frame: number }> = ({ a, frame }) => {
  const { brand, fonts } = useContext(ThemeContext);
  const { fps } = useVideoConfig();
  const local = frame - a.from;
  const exit = exitOf(frame, a);
  const dim = interpolate(local, [0, 8], [0, 1], clamp) * (1 - exit);
  const pop = spring({ frame: local - 2, fps, config: { damping: 14, stiffness: 160 } });
  const count = interpolate(local, [4, 44], [0, 1], {
    ...clamp,
    // Expo-like ease that lands exactly on the value.
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const label = spring({ frame: local - 16, fps, config: { damping: 200 } });
  const decimals = decimalsOf(a.value);
  const done = count >= 0.999;
  const corner = a.at === "center" ? null : a.at;

  const block = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: corner ? (corner.indexOf("left") >= 0 ? "flex-start" : "flex-end") : "center",
        opacity: (1 - exit) * interpolate(pop, [0, 0.5], [0, 1], clamp),
        scale: String(interpolate(pop, [0, 1], [0.86, 1]) - exit * 0.04),
        filter: exit > 0.01 ? `blur(${exit * 8}px)` : undefined,
      }}
    >
      <div
        style={{
          fontFamily: fonts.heading,
          fontWeight: 800,
          fontSize: corner ? 120 : 200,
          lineHeight: 1,
          letterSpacing: "-0.045em",
          fontVariantNumeric: "tabular-nums",
          color: "#fff",
          textShadow: `0 0 ${done ? 70 : 40}px rgba(${brand}, ${done ? 0.32 : 0.18})`,
          whiteSpace: "nowrap",
        }}
      >
        {a.prefix && <span style={{ color: `rgb(${brand})` }}>{a.prefix}</span>}
        {group(a.value * count, decimals)}
        {a.suffix && <span style={{ color: `rgb(${brand})` }}>{a.suffix}</span>}
      </div>
      <div
        style={{
          height: 6,
          width: corner ? 120 : 180,
          marginTop: corner ? 20 : 28,
          borderRadius: 999,
          backgroundColor: `rgb(${brand})`,
          boxShadow: `0 0 26px rgba(${brand}, 0.6)`,
          scale: `${count} 1`,
          transformOrigin: corner && corner.indexOf("right") >= 0 ? "right" : corner ? "left" : "center",
        }}
      />
      {a.label && (
        <div
          style={{
            fontFamily: fonts.body,
            fontWeight: 500,
            fontSize: corner ? 30 : 40,
            color: "rgba(255,255,255,0.78)",
            marginTop: corner ? 18 : 26,
            letterSpacing: "-0.01em",
            opacity: label,
            translate: `0px ${(1 - label) * 14}px`,
          }}
        >
          {a.label}
        </div>
      )}
    </div>
  );

  return (
    <AbsoluteFill>
      {a.dim && <Dim amount={dim} strength={corner ? 0.6 : 1} />}
      <AbsoluteFill
        style={{
          padding: 110,
          alignItems: corner ? (corner.indexOf("left") >= 0 ? "flex-start" : "flex-end") : "center",
          justifyContent: corner ? (corner.indexOf("top") === 0 ? "flex-start" : "flex-end") : "center",
        }}
      >
        {block}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
