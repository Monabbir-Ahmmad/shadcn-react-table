// The full-frame cards: opening/chapter title, the closing card and the stinger transition, in the
// same dark-glass look as the annotations (project addition).
import React, { useContext } from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { KineticText } from "./KineticText";
import { clamp, EndCardSpec, glass, stripAccents, ThemeContext } from "./theme";

export type CardData = {
  title: string;
  subtitle: string;
  kind: "title" | "chapter" | "end" | "stinger";
  from: number;
  durationInFrames: number;
  endCard?: EndCardSpec;
};

/** Thin table rules over the ink, fading towards the edges; drifts slowly. */
const Rules: React.FC<{ frame: number; opacity?: number }> = ({ frame, opacity = 1 }) => {
  const { width: W, height: H } = useVideoConfig();
  const rows = Math.ceil(H / 72) + 2;
  const cols = [0.12, 0.31, 0.47, 0.66, 0.83];
  const drift = (frame * 0.6) % 72;
  return (
    <svg
      width={W}
      height={H}
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        maskImage: "radial-gradient(ellipse 75% 70% at 50% 45%, black 20%, transparent 100%)",
      }}
    >
      {Array.from({ length: rows }, (_, i) => (
        <line key={`r${i}`} x1={0} x2={W} y1={i * 72 - drift} y2={i * 72 - drift} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      ))}
      {cols.map((c) => (
        <line key={`c${c}`} x1={c * W} x2={c * W} y1={0} y2={H} stroke="rgba(255,255,255,0.045)" strokeWidth={1} />
      ))}
    </svg>
  );
};

const Backdrop: React.FC<{ frame: number; duration: number; hero?: boolean }> = ({ frame, duration, hero }) => {
  const { brand, ink } = useContext(ThemeContext);
  return (
    <AbsoluteFill style={{ backgroundColor: ink, overflow: "hidden" }}>
      {hero && (
        <Img
          src={staticFile("hero.jpg")}
          style={{
            position: "absolute",
            inset: -80,
            width: 1920 + 160,
            height: 1080 + 160,
            objectFit: "cover",
            filter: "blur(40px) saturate(1.2)",
            opacity: 0.14,
            scale: String(interpolate(frame, [0, duration], [1.06, 1.14])),
          }}
        />
      )}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 45% at 50% 38%, rgba(${brand}, 0.16) 0%, rgba(${brand}, 0) 70%), linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)`,
        }}
      />
      <Rules frame={frame} />
    </AbsoluteFill>
  );
};

const fadeOf = (frame: number, duration: number, fps: number, out = true) =>
  Math.min(
    interpolate(frame, [0, 0.3 * fps], [0, 1], clamp),
    out ? interpolate(frame, [duration - 0.3 * fps, duration], [1, 0], clamp) : 1,
  );

const Eyebrow: React.FC<{ text: string; frame: number }> = ({ text, frame }) => {
  const { brand, fonts } = useContext(ThemeContext);
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 } });
  if (!text) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        fontFamily: fonts.mono,
        fontWeight: 500,
        fontSize: 24,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: `rgb(${brand})`,
        opacity: s,
        translate: `0px ${(1 - s) * 12}px`,
      }}
    >
      <span style={{ width: 36 * s, height: 2, backgroundColor: `rgb(${brand})`, boxShadow: `0 0 10px rgba(${brand},0.8)` }} />
      {text}
      <span style={{ width: 36 * s, height: 2, backgroundColor: `rgb(${brand})`, boxShadow: `0 0 10px rgba(${brand},0.8)` }} />
    </div>
  );
};

const parseChapter = (title: string) => {
  const m = title.match(/^(\d+)\s+([\s\S]*)$/);
  return m ? { part: Number(m[1]), text: m[2] } : { part: null, text: title };
};

/** Opening and chapter cards (and a plain closing card): hero under ink, kinetic title. */
export const TitleCard: React.FC<{ card: CardData; parts: number }> = ({ card, parts }) => {
  const { brand, fonts, eyebrow: themeEyebrow, footer } = useContext(ThemeContext);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fade = fadeOf(frame, card.durationInFrames, fps, card.kind !== "end");
  const late = spring({ frame: frame - 0.45 * fps, fps, config: { damping: 200 } });
  const { part, text } = parseChapter(card.title);
  const isChapter = card.kind === "chapter";
  // `**word**` marks the accent; without one, a chapter title's last word takes it.
  let title = text;
  if (title.indexOf("**") < 0 && isChapter) {
    const words = title.split(" ");
    if (words.length > 1) title = `${words.slice(0, -1).join(" ")} **${words[words.length - 1]}**`;
  }
  const eyebrow = isChapter && parts > 1 ? `Part ${part} of ${parts}` : themeEyebrow;
  const size = stripAccents(title).length > 34 ? 88 : 108;

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Backdrop frame={frame} duration={card.durationInFrames} hero />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 200px" }}>
        <Eyebrow text={eyebrow} frame={frame - 2} />
        <div style={{ marginTop: 34, maxWidth: 1500 }}>
          <KineticText text={title} frame={frame - 6} fontSize={size} stagger={3} />
        </div>
        {card.subtitle && isChapter && (
          <div
            style={{
              ...glass(brand, 0.14),
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 48,
              padding: "14px 28px",
              borderRadius: 999,
              color: "rgba(255,255,255,0.92)",
              fontFamily: fonts.body,
              fontWeight: 500,
              fontSize: 28,
              opacity: late,
              translate: `0px ${(1 - late) * 18}px`,
            }}
          >
            <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: `rgb(${brand})`, boxShadow: `0 0 12px rgba(${brand},0.9)` }} />
            {card.subtitle}
          </div>
        )}
        {card.subtitle && !isChapter && (
          <div
            style={{
              fontFamily: fonts.body,
              fontWeight: 500,
              fontSize: 36,
              color: "rgba(255,255,255,0.7)",
              marginTop: 36,
              opacity: late,
              translate: `0px ${(1 - late) * 18}px`,
            }}
          >
            {card.subtitle}
          </div>
        )}
      </AbsoluteFill>
      {footer && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 64,
            textAlign: "center",
            fontFamily: fonts.mono,
            fontSize: 22,
            letterSpacing: "0.04em",
            color: "rgba(255,255,255,0.45)",
            opacity: late,
          }}
        >
          {footer}
        </div>
      )}
    </AbsoluteFill>
  );
};

/** The closing card from the scene's `end:` block: title, a typed command, link chips, footer. */
export const EndCard: React.FC<{ card: CardData }> = ({ card }) => {
  const { brand, fonts, footer: themeFooter } = useContext(ThemeContext);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const spec = card.endCard ?? {};
  const fade = interpolate(frame, [0, 0.3 * fps], [0, 1], clamp);
  const command = spec.command ?? "";
  const term = spring({ frame: frame - 14, fps, config: { damping: 18, stiffness: 150 } });
  const typeStart = 22;
  const typeFrames = Math.min(command.length * 1.3, 40);
  const typed = Math.floor(
    interpolate(frame, [typeStart, typeStart + typeFrames], [0, command.length], clamp),
  );
  const done = typed >= command.length;
  const caretOn = !done || Math.floor((frame - typeStart - typeFrames) / 16) % 2 === 0;
  const linksAt = typeStart + typeFrames + 4;
  const footer = spec.footer ?? themeFooter;
  const footerIn = spring({ frame: frame - linksAt - 10, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Backdrop frame={frame} duration={card.durationInFrames} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 160px" }}>
        <div style={{ maxWidth: 1600 }}>
          <KineticText text={spec.title ?? card.title} frame={frame - 4} fontSize={stripAccents(spec.title ?? card.title).length > 30 ? 96 : 120} />
        </div>
        {command && (
          <div
            style={{
              ...glass(brand, 0.24),
              marginTop: 64,
              borderRadius: 20,
              padding: "24px 34px",
              display: "flex",
              alignItems: "center",
              gap: 22,
              fontFamily: fonts.mono,
              fontWeight: 500,
              fontSize: 34,
              color: "#f1f5f9",
              opacity: interpolate(term, [0, 0.5], [0, 1], clamp),
              scale: String(interpolate(term, [0, 1], [0.94, 1])),
              translate: `0px ${(1 - term) * 20}px`,
            }}
          >
            <span style={{ color: `rgb(${brand})`, fontWeight: 600 }}>$</span>
            <span style={{ position: "relative", whiteSpace: "pre" }}>
              <span style={{ opacity: 0 }}>{command}</span>
              <span style={{ position: "absolute", left: 0, top: 0 }}>
                {command.slice(0, typed)}
                <span
                  style={{
                    display: "inline-block",
                    width: "0.55em",
                    height: "1.05em",
                    verticalAlign: "-0.17em",
                    marginLeft: 3,
                    borderRadius: 2,
                    backgroundColor: `rgba(${brand}, ${caretOn ? 0.9 : 0})`,
                    boxShadow: caretOn ? `0 0 14px rgba(${brand}, 0.6)` : undefined,
                  }}
                />
              </span>
            </span>
          </div>
        )}
        {spec.links && spec.links.length > 0 && (
          <div style={{ display: "flex", gap: 18, marginTop: 40, flexWrap: "wrap", justifyContent: "center" }}>
            {spec.links.map((l, i) => {
              const s = spring({ frame: frame - (command ? linksAt : 18) - i * 4, fps, config: { damping: 16, stiffness: 180 } });
              return (
                <div
                  key={l}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 24px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.14)",
                    backgroundColor: "rgba(255,255,255,0.04)",
                    fontFamily: fonts.body,
                    fontWeight: 500,
                    fontSize: 26,
                    color: "rgba(255,255,255,0.88)",
                    opacity: interpolate(s, [0, 0.5], [0, 1], clamp),
                    translate: `0px ${(1 - s) * 16}px`,
                  }}
                >
                  <svg width={18} height={18} viewBox="0 0 18 18">
                    <path d="M6 3h9v9M15 3 3 15" stroke={`rgb(${brand})`} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {l}
                </div>
              );
            })}
          </div>
        )}
      </AbsoluteFill>
      {footer && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 64,
            textAlign: "center",
            fontFamily: fonts.mono,
            fontSize: 22,
            letterSpacing: "0.04em",
            color: "rgba(255,255,255,0.45)",
            opacity: footerIn,
          }}
        >
          {footer}
        </div>
      )}
    </AbsoluteFill>
  );
};

/**
 * A short section transition: an ink panel wipes over the last frame with table rules sweeping
 * across, the text slams in, then the panel wipes off to reveal the next frame (drawn under it).
 */
export const Stinger: React.FC<{ card: CardData }> = ({ card }) => {
  const { brand } = useContext(ThemeContext);
  const frame = useCurrentFrame();
  const { fps, width: W, height: H } = useVideoConfig();
  const n = card.durationInFrames;
  const wipeIn = interpolate(frame, [0, 6], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const wipeOut = interpolate(frame, [n - 7, n], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const slam = spring({ frame: frame - 4, fps, config: { damping: 13, stiffness: 260, mass: 0.7 } });
  const { ink } = useContext(ThemeContext);
  const rows = Math.ceil(H / 72);

  return (
    <AbsoluteFill
      style={{
        clipPath: `inset(0 ${(1 - wipeIn) * 100}% 0 ${wipeOut * 100}%)`,
        backgroundColor: ink,
      }}
    >
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 40% at 50% 50%, rgba(${brand}, 0.18) 0%, rgba(${brand}, 0) 70%)` }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: rows }, (_, i) => {
          const p = interpolate(frame, [i * 0.6, i * 0.6 + 7], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
          const y = i * 72 + 36;
          return (
            <g key={i}>
              <line x1={0} x2={W * p} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
              {p < 1 && <circle cx={W * p} cy={y} r={2.5} fill={`rgb(${brand})`} opacity={1 - p} />}
            </g>
          );
        })}
      </svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 160px" }}>
        <div
          style={{
            opacity: interpolate(slam, [0, 0.4], [0, 1], clamp),
            scale: String(interpolate(slam, [0, 1], [1.7, 1])),
            filter: slam < 0.98 ? `blur(${(1 - Math.min(slam, 1)) * 18}px)` : undefined,
            translate: `${-wipeOut * 80}px 0px`,
          }}
        >
          <KineticText text={card.title} frame={99} fontSize={stripAccents(card.title).length > 24 ? 96 : 124} weight={800} />
          <div
            style={{
              height: 6,
              width: 140,
              margin: "26px auto 0",
              borderRadius: 999,
              backgroundColor: `rgb(${brand})`,
              boxShadow: `0 0 22px rgba(${brand}, 0.7)`,
              scale: `${interpolate(frame, [7, 14], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) })} 1`,
            }}
          />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
