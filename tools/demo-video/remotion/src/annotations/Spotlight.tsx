import React, { useContext } from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import { exitOf } from "./Headline";
import { Camera, clamp, SpotlightSpan, ThemeContext, toScreen } from "./theme";

/** Dims everything but the element (rounded, feathered hole); glides between spotlights. */
export const Spotlight: React.FC<{ a: SpotlightSpan; frame: number; cam: Camera }> = ({
  a,
  frame,
  cam,
}) => {
  const { brand } = useContext(ThemeContext);
  const { fps, width: W, height: H } = useVideoConfig();
  const local = frame - a.from;
  const exit = a.continues ? 0 : exitOf(frame, a);
  const settle = spring({ frame: local, fps, config: { damping: 22, stiffness: 120 } });
  const target = toScreen(a.box, cam);
  const start = a.fromBox ? toScreen(a.fromBox, cam) : null;
  const lerp = (p: number, q: number) => p + (q - p) * settle;
  const b = start
    ? { x: lerp(start.x, target.x), y: lerp(start.y, target.y), w: lerp(start.w, target.w), h: lerp(start.h, target.h) }
    : target;
  // A fresh spotlight closes in on the element; leaving, the hole opens back up.
  const grow = (start ? 0 : (1 - settle) * 70) + exit * 50;
  const pad = a.pad * cam.k + grow;
  const x = b.x - pad;
  const y = b.y - pad;
  const w = b.w + pad * 2;
  const h = b.h + pad * 2;
  const rx = Math.min(18 + grow * 0.3, h / 2, w / 2);
  const amount = (start ? 1 : interpolate(local, [0, 10], [0, 1], clamp)) * (1 - exit);
  const id = `spot-${a.from}`;

  return (
    <AbsoluteFill style={{ opacity: amount }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id={`${id}-f`} filterUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
            <feGaussianBlur stdDeviation={9} />
          </filter>
          <mask id={`${id}-m`} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
            <rect x={0} y={0} width={W} height={H} fill="white" />
            <rect x={x} y={y} width={w} height={h} rx={rx} fill="black" filter={`url(#${id}-f)`} />
          </mask>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill="rgba(6,7,9,0.72)" mask={`url(#${id}-m)`} />
        <rect
          x={x - 3}
          y={y - 3}
          width={w + 6}
          height={h + 6}
          rx={rx + 3}
          fill="none"
          stroke={`rgba(${brand}, 0.55)`}
          strokeWidth={1.5}
          style={{ filter: `drop-shadow(0 0 14px rgba(${brand}, 0.45))` }}
        />
      </svg>
    </AbsoluteFill>
  );
};
