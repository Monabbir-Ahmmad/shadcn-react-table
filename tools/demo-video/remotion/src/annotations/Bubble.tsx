import React, { useContext } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useVideoConfig } from "remotion";
import { exitOf } from "./Headline";
import { accentRuns, BubbleSpan, Camera, clamp, Side, ThemeContext, toScreen } from "./theme";

const FONT = 36;
const LINE_H = 48;
const PAD_X = 30;
const PAD_Y = 20;
const MAX_W = 1100;
const TAIL = 18;
// The tail's gap from the element it points at.
const GAP = 16;
// Average glyph width of the body font at FONT px, for sizing the bubble before layout.
const CHAR_W = FONT * 0.46;
const SURFACE = "rgba(16,18,22,0.95)";

const bubbleWidth = (text: string) =>
  Math.min(MAX_W, Math.ceil(text.replace(/\*\*/g, "").length * CHAR_W) + PAD_X * 2 + 8);
const bubbleHeight = (text: string) => {
  const w = bubbleWidth(text) - PAD_X * 2;
  const lines = Math.max(1, Math.ceil((text.replace(/\*\*/g, "").length * CHAR_W) / w));
  return lines * LINE_H + PAD_Y * 2;
};

/**
 * A speech bubble that says the voice line, word by word as it is spoken. With an element box its
 * tail points at the element and it rides the camera; without one it is a plain caption low in the
 * frame, with no tail.
 */
export const Bubble: React.FC<{ a: BubbleSpan; frame: number; cam: Camera }> = ({ a, frame, cam }) => {
  const { brand, fonts } = useContext(ThemeContext);
  const { fps, width: W, height: H } = useVideoConfig();
  const local = frame - a.from;
  const exit = exitOf(frame, a);
  const bw = bubbleWidth(a.text);
  const bh = bubbleHeight(a.text);

  // Where the bubble sits and where its tail points.
  let left: number;
  let top: number;
  let side: Side;
  let tip: { x: number; y: number };
  let ring: { x: number; y: number; w: number; h: number } | null = null;
  if (a.box) {
    const el = toScreen(a.box, cam);
    ring = el;
    side = a.side ?? (el.y > bh + 120 ? "top" : "bottom");
    const cx = el.x + el.w / 2;
    const cy = el.y + el.h / 2;
    if (side === "top" || side === "bottom") {
      tip = { x: cx, y: side === "top" ? el.y - GAP : el.y + el.h + GAP };
      left = Math.min(Math.max(cx - bw * 0.3, 32), W - 32 - bw);
      top = side === "top" ? tip.y - TAIL - bh : tip.y + TAIL;
    } else {
      tip = { x: side === "left" ? el.x - GAP : el.x + el.w + GAP, y: cy };
      left = side === "left" ? tip.x - TAIL - bw : tip.x + TAIL;
      top = Math.min(Math.max(cy - bh / 2, 32), H - 32 - bh);
    }
  } else {
    side = "bottom";
    left = (W - bw) / 2;
    top = H - 64 - bh;
    tip = { x: left + 56, y: top + bh + TAIL };
  }

  const pop = spring({ frame: local, fps, config: { damping: 14, stiffness: 210, mass: 0.7 } });
  const ringIn = interpolate(local, [0, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  // Words light up across the spoken span.
  const words = accentRuns(a.text).flatMap((run) =>
    run.text
      .split(/(\s+)/)
      .filter(Boolean)
      .map((w) => ({ w, accent: run.accent })),
  );
  const spoken = words.filter((x) => x.w.trim()).length;
  const lit = interpolate(local, [a.speakAt, a.speakAt + Math.max(1, a.speakFrames)], [0, spoken], clamp);
  let n = 0;

  // The tail: a square turned 45°, half hidden under the bubble, on the side facing the element.
  const tailStyle: React.CSSProperties = { position: "absolute", width: TAIL * 1.6, height: TAIL * 1.6 };
  const along = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo + 26), hi - 26) - TAIL * 0.8;
  if (side === "top") Object.assign(tailStyle, { left: along(tip.x - left, 0, bw), bottom: -TAIL * 0.8 });
  else if (side === "bottom") Object.assign(tailStyle, { left: along(tip.x - left, 0, bw), top: -TAIL * 0.8 });
  else if (side === "left") Object.assign(tailStyle, { top: along(tip.y - top, 0, bh), right: -TAIL * 0.8 });
  else Object.assign(tailStyle, { top: along(tip.y - top, 0, bh), left: -TAIL * 0.8 });
  const origin = `${tip.x - left}px ${tip.y - top}px`;

  return (
    <AbsoluteFill style={{ opacity: 1 - exit }}>
      {ring && (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <rect
            x={ring.x - 6}
            y={ring.y - 6}
            width={ring.w + 12}
            height={ring.h + 12}
            rx={12}
            fill={`rgba(${brand}, ${0.08 * ringIn})`}
            stroke={`rgba(${brand}, ${0.95 * ringIn})`}
            strokeWidth={2.5}
            style={{ filter: `drop-shadow(0 0 10px rgba(${brand}, 0.5))` }}
          />
        </svg>
      )}
      <div
        style={{
          position: "absolute",
          left,
          top,
          width: bw,
          transformOrigin: origin,
          scale: String(interpolate(pop, [0, 1], [0.6, 1])),
          opacity: interpolate(pop, [0, 0.5], [0, 1], clamp),
          translate: `0px ${exit * (side === "top" ? -10 : 10)}px`,
        }}
      >
        {a.box && (
          <div
            style={{
              ...tailStyle,
              background: SURFACE,
              border: `1.5px solid rgba(${brand}, 0.55)`,
              borderRadius: 4,
              rotate: "45deg",
            }}
          />
        )}
        <div
          style={{
            position: "relative",
            background: SURFACE,
            border: `1.5px solid rgba(${brand}, 0.55)`,
            borderRadius: 26,
            padding: `${PAD_Y}px ${PAD_X}px`,
            boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 40px rgba(${brand}, 0.18)`,
            fontFamily: fonts.body,
            fontWeight: 600,
            fontSize: FONT,
            lineHeight: `${LINE_H}px`,
            letterSpacing: "-0.015em",
          }}
        >
          {words.map((x, i) => {
            if (!x.w.trim()) return <span key={i}>{x.w}</span>;
            const k = Math.min(1, Math.max(0, lit - n));
            n += 1;
            const on = x.accent ? `rgb(${brand})` : "#fff";
            return (
              <span
                key={i}
                style={{
                  color: on,
                  opacity: 0.3 + 0.7 * k,
                  textShadow: x.accent ? `0 0 18px rgba(${brand}, ${0.5 * k})` : undefined,
                }}
              >
                {x.w}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
