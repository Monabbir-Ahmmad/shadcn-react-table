import React, { useContext } from "react";
import { interpolate, spring, useVideoConfig } from "remotion";
import { exitOf } from "./Headline";
import { Camera, clamp, KeysSpan, ThemeContext } from "./theme";

const KEY_H = 68;
const keyWidth = (k: string) => Math.max(KEY_H, k.length * 17 + 44 + (/^click$/i.test(k) ? 30 : 0));

const Mouse: React.FC<{ color: string }> = ({ color }) => (
  <svg width={20} height={28} viewBox="0 0 20 28" style={{ marginRight: 10 }}>
    <rect x={1.5} y={1.5} width={17} height={25} rx={8.5} fill="none" stroke="#fff" strokeWidth={2.4} />
    <path d="M10 1.5 V11 M1.5 11 H10" stroke="#fff" strokeWidth={2.4} />
    <path d="M2.6 10 V8 A7.4 7.4 0 0 1 10 1.5 V10 Z" fill={color} />
  </svg>
);

/** 3D keycaps that pop in beside the cursor (never over it), press once, and leave. */
export const Keycaps: React.FC<{ a: KeysSpan; frame: number; cam: Camera }> = ({
  a,
  frame,
  cam,
}) => {
  const { brand, fonts } = useContext(ThemeContext);
  const { fps, width: W, height: H } = useVideoConfig();
  const local = frame - a.from;
  const exit = exitOf(frame, a);
  const px = (a.x - cam.x0) * cam.k;
  const py = (a.y - cam.y0) * cam.k;
  const groupW = a.keys.reduce((s, k) => s + keyWidth(k), 0) + (a.keys.length - 1) * 44;
  // Below and right of the cursor tip; flipped when that would leave the frame.
  const left = px + 44 + groupW > W - 30 ? px - 30 - groupW : px + 44;
  const top = py + 58 + KEY_H > H - 30 ? py - 40 - KEY_H : py + 58;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: 1 - exit,
        translate: `0px ${exit * 12}px`,
      }}
    >
      {a.keys.map((k, i) => {
        const pop = spring({ frame: local - i * 4, fps, config: { damping: 12, stiffness: 230, mass: 0.6 } });
        const pressAt = 8 + i * 4;
        const press = interpolate(local, [pressAt, pressAt + 2, pressAt + 7], [0, 1, 0], clamp);
        const held = a.keys.length > 1 && i < a.keys.length - 1 ? Math.min(1, Math.max(0, (local - pressAt) / 2)) * 0.6 : 0;
        const down = Math.max(press, held);
        const depth = 7 - down * 4;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <span
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: fonts.body,
                  fontWeight: 600,
                  fontSize: 22,
                  lineHeight: 1,
                  color: `rgb(${brand})`,
                  backgroundColor: "rgba(14,15,18,0.88)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  opacity: interpolate(pop, [0, 0.6], [0, 1], clamp),
                }}
              >
                +
              </span>
            )}
            <div
              style={{
                height: KEY_H,
                minWidth: keyWidth(k),
                padding: "0 22px",
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 14,
                fontFamily: fonts.body,
                fontWeight: 600,
                fontSize: 28,
                color: "#fff",
                background: "linear-gradient(180deg, #3a3d44 0%, #202227 100%)",
                border: "1px solid rgba(255,255,255,0.13)",
                boxShadow: [
                  "inset 0 1px 0 rgba(255,255,255,0.2)",
                  "inset 0 -3px 0 rgba(0,0,0,0.3)",
                  `0 ${depth}px 0 #0c0d0f`,
                  `0 ${depth + 12}px 22px rgba(0,0,0,0.45)`,
                  `0 0 ${28 * down}px rgba(${brand}, ${0.55 * down})`,
                ].join(", "),
                opacity: interpolate(pop, [0, 0.5], [0, 1], clamp),
                scale: String(interpolate(pop, [0, 1], [0.6, 1])),
                translate: `0px ${(1 - pop) * 16 + (7 - depth)}px`,
              }}
            >
              {/^click$/i.test(k) && <Mouse color={`rgba(${brand}, ${0.4 + 0.6 * down})`} />}
              {k}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};
