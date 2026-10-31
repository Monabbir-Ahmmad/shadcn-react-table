import React, { useContext } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useVideoConfig } from "remotion";
import { exitOf } from "./Headline";
import { Box, CalloutSpan, Camera, clamp, glass, Side, ThemeContext, toScreen } from "./theme";

const PILL_H = 62;
const GAP = 8;
const LINE = { v: 92, h: 84 };
const pillWidth = (text: string) => text.length * 15.5 + 92;

/** The side with the most room for the pill, judged on the camera of the callout's first frame. */
export const pickSide = (el: Box, text: string, W: number, H: number): Side => {
  const pw = pillWidth(text);
  const scores: [Side, number][] = [
    ["top", el.y - (LINE.v + PILL_H + 40)],
    ["bottom", H - (el.y + el.h) - (LINE.v + PILL_H + 40)],
    ["right", W - (el.x + el.w) - (LINE.h + pw + 40)],
    ["left", el.x - (LINE.h + pw + 40)],
  ];
  // Above or below reads more naturally; prefer them when they fit.
  const fits = scores.filter(([s, v]) => v >= 0 && (s === "top" || s === "bottom"));
  const pool = fits.length ? fits : scores;
  return pool.reduce((a, b) => (b[1] > a[1] ? b : a))[0];
};

/** A label pill with a connector that draws itself to the element, glued to it through the camera. */
export const Callout: React.FC<{ a: CalloutSpan; frame: number; cam: Camera; firstCam: Camera }> = ({
  a,
  frame,
  cam,
  firstCam,
}) => {
  const { brand, fonts } = useContext(ThemeContext);
  const { fps, width: W, height: H } = useVideoConfig();
  const local = frame - a.from;
  const exit = exitOf(frame, a);
  const el = toScreen(a.box, cam);
  const side = a.side ?? pickSide(toScreen(a.box, firstCam), a.text, W, H);
  const pw = pillWidth(a.text);

  // Anchor on the element's edge, then the line out to the pill's facing edge.
  const cx = Math.min(Math.max(el.x + el.w / 2, 60), W - 60);
  const cy = Math.min(Math.max(el.y + el.h / 2, 60), H - 60);
  let ax = cx;
  let ay = cy;
  let ex = cx;
  let ey = cy;
  if (side === "top") {
    ay = el.y - GAP;
    ey = Math.max(ay - LINE.v, PILL_H + 30);
  } else if (side === "bottom") {
    ay = el.y + el.h + GAP;
    ey = Math.min(ay + LINE.v, H - PILL_H - 30);
  } else if (side === "left") {
    ax = el.x - GAP;
    ex = Math.max(ax - LINE.h, pw + 30);
  } else {
    ax = el.x + el.w + GAP;
    ex = Math.min(ax + LINE.h, W - pw - 30);
  }
  // Pill position: its facing edge sits on the line end; kept inside the frame.
  const vertical = side === "top" || side === "bottom";
  const pillCx = vertical ? Math.min(Math.max(ex, 40 + pw / 2), W - 40 - pw / 2) : 0;
  const pillStyle: React.CSSProperties = vertical
    ? { left: pillCx - pw / 2, width: pw, top: side === "top" ? ey - PILL_H : ey, justifyContent: "center" }
    : side === "left"
      ? { right: W - ex, top: ey - PILL_H / 2 }
      : { left: ex, top: ey - PILL_H / 2 };

  const dot = spring({ frame: local, fps, config: { damping: 11, stiffness: 220 } });
  const draw = interpolate(local, [3, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const outline = interpolate(local, [0, 16], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const pill = spring({ frame: local - 11, fps, config: { damping: 15, stiffness: 190 } });
  const pulse = interpolate(local, [2, 22], [0, 1], clamp);
  const lineLen = Math.hypot(ex - ax, ey - ay);
  const r = 12;
  const pad = 6;
  const ox = el.x - pad;
  const oy = el.y - pad;
  const ow = el.w + pad * 2;
  const oh = el.h + pad * 2;
  const perimeter = 2 * (ow + oh);
  const fade = 1 - exit;
  const away = { top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0] }[side];

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <rect
          x={ox}
          y={oy}
          width={ow}
          height={oh}
          rx={r}
          fill={`rgba(${brand}, ${0.07 * outline})`}
          stroke={`rgb(${brand})`}
          strokeWidth={2.5}
          strokeDasharray={perimeter}
          strokeDashoffset={perimeter * (1 - outline)}
          style={{ filter: `drop-shadow(0 0 10px rgba(${brand}, 0.55))` }}
        />
        <line
          x1={ax}
          y1={ay}
          x2={ax + (ex - ax) * draw}
          y2={ay + (ey - ay) * draw}
          stroke={`rgb(${brand})`}
          strokeWidth={3}
          strokeLinecap="round"
          opacity={lineLen > 1 ? 1 : 0}
          style={{ filter: `drop-shadow(0 0 6px rgba(${brand}, 0.6))` }}
        />
        <circle
          cx={ax}
          cy={ay}
          r={7 + pulse * 18}
          fill="none"
          stroke={`rgba(${brand}, ${0.7 * (1 - pulse)})`}
          strokeWidth={2.5}
        />
        <circle cx={ax} cy={ay} r={8 * Math.max(0, dot)} fill="#0b0c0e" stroke={`rgb(${brand})`} strokeWidth={3.5} />
      </svg>
      <div
        style={{
          position: "absolute",
          height: PILL_H,
          display: "flex",
          alignItems: "center",
          ...pillStyle,
          opacity: interpolate(pill, [0, 0.6], [0, 1], clamp),
          scale: String(interpolate(pill, [0, 1], [0.85, 1])),
          translate: `${(1 - pill) * away[0] * 14 + exit * away[0] * 10}px ${(1 - pill) * away[1] * 14 + exit * away[1] * 10}px`,
          transformOrigin: side === "top" ? "bottom" : side === "bottom" ? "top" : side === "left" ? "right" : "left",
        }}
      >
        <div
          style={{
            ...glass(brand, 0.22),
            height: PILL_H,
            borderRadius: 999,
            padding: "0 28px 0 22px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontFamily: fonts.body,
            fontWeight: 600,
            fontSize: 28,
            letterSpacing: "-0.01em",
            color: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: `rgb(${brand})`,
              boxShadow: `0 0 12px rgba(${brand}, 0.9)`,
            }}
          />
          {a.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
