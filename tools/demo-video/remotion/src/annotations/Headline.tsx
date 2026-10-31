import React, { useContext } from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { KineticText } from "./KineticText";
import { clamp, glass, HeadlineSpan, stripAccents, ThemeContext } from "./theme";

/** Darkens and softly blurs the page under a headline or stat. */
export const Dim: React.FC<{ amount: number; strength?: number }> = ({
  amount,
  strength = 1,
}) =>
  amount <= 0 ? null : (
    <AbsoluteFill
      style={{
        opacity: amount,
        background: `radial-gradient(ellipse 70% 65% at 50% 50%, rgba(7,8,10,${0.7 * strength}) 0%, rgba(7,8,10,${0.86 * strength}) 100%)`,
        backdropFilter: `blur(${6 * amount * strength}px) saturate(${1 - 0.3 * amount})`,
      }}
    />
  );

/** Progress of the exit (0..1) between exitAt and to, eased in. */
export const exitOf = (frame: number, a: { exitAt: number; to: number }) =>
  a.to <= a.exitAt
    ? 0
    : interpolate(frame, [a.exitAt, a.to], [0, 1], {
        ...clamp,
        easing: Easing.in(Easing.cubic),
      });

export const Headline: React.FC<{ a: HeadlineSpan; frame: number }> = ({
  a,
  frame,
}) => {
  const { brand } = useContext(ThemeContext);
  const local = frame - a.from;
  const exit = exitOf(frame, a);
  const dim = interpolate(local, [0, 8], [0, 1], clamp) * (1 - exit);
  const plain = stripAccents(a.text);
  const size = a.dim
    ? plain.length <= 26
      ? 112
      : plain.length <= 44
        ? 92
        : 74
    : 64;
  const text = (
    <KineticText text={a.text} frame={local} exit={exit} fontSize={size} />
  );

  return (
    <AbsoluteFill>
      {a.dim && <Dim amount={dim} />}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent:
            a.position === "top"
              ? "flex-start"
              : a.position === "bottom"
                ? "flex-end"
                : "center",
          padding: "110px 160px",
          textAlign: "center",
        }}
      >
        {a.dim ? (
          <div style={{ maxWidth: 1500 }}>{text}</div>
        ) : (
          <div
            style={{
              ...glass(brand),
              borderRadius: 30,
              padding: "26px 46px 32px",
              maxWidth: 1500,
              opacity: interpolate(local, [0, 6], [0, 1], clamp) * (1 - exit),
              scale: String(interpolate(local, [0, 10], [0.96, 1], clamp)),
            }}
          >
            {text}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
