import { Audio } from "@remotion/media";
import React, { useContext, useEffect, useState } from "react";
import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Composition,
  continueRender,
  delayRender,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  Annotation,
  Annotations,
  AnnotationsUnder,
  Camera,
  CardData,
  DEFAULT_THEME,
  EndCard,
  Stinger,
  Theme,
  ThemeContext,
  TitleCard,
} from "./annotations";
import mix from "./mix.json";

// Shapes written by prepare.mjs into public/<scene>/timeline.json.
type ScreenFrame = {
  img: number;
  x0: number;
  y0: number;
  k: number;
  mx: number;
  my: number;
  cap: number;
  capFrom: number;
  role: number;
  typing: boolean;
};
/** A card frame; a stinger's frames also name the screen frame drawn under its wipe. */
type CardFrame = { card: number };
/** A stinger frame, with the screen frame drawn under its wipe. */
type StingerFrame = { stinger: number; under?: number };
/**
 * title: opening card; chapter: "N  Title" with a part label; end: closing card (with the scene's
 * own content in endCard when it set one); stinger: a short section transition.
 */
type Card = CardData;
type Sound = {
  frame: number;
  kind: keyof typeof mix.effects;
  /** Path under public/. */
  file: string;
  volume?: number;
};
type Timeline = {
  scene: string;
  theme: Theme;
  /** How many clips there are, for the "Part N of M" label. */
  parts: number;
  fps: number;
  width: number;
  height: number;
  source: { width: number; height: number };
  durationInFrames: number;
  frames: (ScreenFrame | CardFrame | StingerFrame)[];
  cards: Card[];
  /** Short section transitions (project addition); not cards, so the music stays down. */
  stingers?: Card[];
  captions: string[];
  roles: string[];
  ripples: { frame: number; x: number; y: number }[];
  sounds: Sound[];
  /** The annotation kit's overlays (project addition). */
  annotations?: Annotation[];
  /** Voiceover markers at their output time in seconds (read by the voiceover script). */
  voiceCues?: { text: string; at: number }[];
};

type Props = {
  /** Which clip: a folder under public/ written by prepare.mjs. */
  readonly scene: string;
  readonly timeline: Timeline | null;
};

/** Loads the theme's font files once and holds rendering until they are ready. */
const useThemeFonts = (theme: Theme | undefined) => {
  const [handle] = useState(() => delayRender("Loading fonts"));
  useEffect(() => {
    Promise.all(
      (theme?.fontFiles ?? []).map((f) =>
        new FontFace(f.family, `url(${staticFile(f.file)})`, {
          weight: String(f.weight),
        })
          .load()
          .then((face) => document.fonts.add(face)),
      ),
    )
      .catch(() => undefined)
      .finally(() => continueRender(handle));
  }, [theme, handle]);
};

const isScreen = (
  f: ScreenFrame | CardFrame | StingerFrame | undefined,
): f is ScreenFrame => Boolean(f && "img" in f);

const calculateMetadata: CalculateMetadataFunction<Props> = async ({
  props,
}) => {
  const timeline: Timeline = await (
    await fetch(staticFile(`${props.scene}/timeline.json`))
  ).json();
  return {
    durationInFrames: timeline.durationInFrames,
    fps: timeline.fps,
    width: timeline.width,
    height: timeline.height,
    props: { ...props, timeline },
  };
};

export const DemoComposition = () => {
  return (
    <Composition
      id="Clip"
      component={Demo}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ scene: "assessment", timeline: null }}
      calculateMetadata={calculateMetadata}
    />
  );
};

const Cursor: React.FC<{ x: number; y: number; scale: number }> = ({
  x,
  y,
  scale,
}) => (
  <svg
    width={34}
    height={44}
    viewBox="-2 -2 30 44"
    style={{
      position: "absolute",
      left: x - 2 * scale,
      top: y - 2 * scale,
      scale: String(scale),
      transformOrigin: "0 0",
      filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))",
    }}
  >
    <path
      d="M0 0 L0 34 L8 26 L14 40 L20 37 L14 24 L25 24 Z"
      fill="#111"
      stroke="#fff"
      strokeWidth={2.6}
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * The take at one output frame. `index` draws another frame's picture instead (under a stinger's
 * wipe), without annotations, ripples or caption.
 */
const Screen: React.FC<{ timeline: Timeline; index?: number }> = ({
  timeline,
  index,
}) => {
  const { brand: BRAND, fonts } = useContext(ThemeContext);
  const current = useCurrentFrame();
  const peek = index !== undefined;
  const frame = peek ? index : current;
  const f = timeline.frames[frame];
  if (!isScreen(f)) return null;
  const annotations = peek ? [] : (timeline.annotations ?? []);
  const camAt = (i: number): Camera => {
    const g = timeline.frames[i];
    return isScreen(g) ? g : f;
  };
  const { source } = timeline;
  const pressed = timeline.ripples.some(
    (r) => frame >= r.frame && frame - r.frame <= 3,
  );
  const captionOpacity = interpolate(frame - f.capFrom, [0, 9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#fff", overflow: "hidden" }}>
      <Img
        src={staticFile(`${timeline.scene}/take/${f.img}.jpg`)}
        style={{
          position: "absolute",
          left: -f.x0 * f.k,
          top: -f.y0 * f.k,
          width: source.width * f.k,
          height: source.height * f.k,
        }}
      />
      <AnnotationsUnder list={annotations} frame={frame} cam={f} />
      {timeline.ripples
        .filter((r) => !peek && frame >= r.frame && frame - r.frame < 17)
        .map((r) => {
          const age = (frame - r.frame) / 16;
          const size = 28 + age * 110;
          return (
            <div
              key={r.frame}
              style={{
                position: "absolute",
                left: (r.x - f.x0) * f.k - size / 2,
                top: (r.y - f.y0) * f.k - size / 2,
                width: size,
                height: size,
                borderRadius: "50%",
                border: `4px solid rgba(${BRAND}, ${0.7 * (1 - age)})`,
                backgroundColor: `rgba(${BRAND}, ${0.18 * (1 - age)})`,
              }}
            />
          );
        })}
      <Annotations list={annotations} frame={frame} cam={f} camAt={camAt} />
      <Cursor
        x={(f.mx - f.x0) * f.k}
        y={(f.my - f.y0) * f.k}
        scale={(pressed ? 0.88 : 1) * (0.7 + 0.17 * f.k)}
      />
      {f.cap >= 0 && !peek && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 70,
            display: "flex",
            justifyContent: "center",
            opacity: captionOpacity,
            translate: `0px ${(1 - captionOpacity) * 14}px`,
          }}
        >
          <div
            style={{
              fontFamily: fonts.body,
              fontWeight: 600,
              fontSize: 34,
              color: "#fff",
              padding: "18px 34px",
              borderRadius: 22,
              backgroundColor: "rgba(15, 23, 42, 0.88)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              maxWidth: 1600,
            }}
          >
            {timeline.captions[f.cap]}
          </div>
        </div>
      )}
      {f.role >= 0 && (
        <div
          style={{
            position: "absolute",
            right: 28,
            bottom: 28,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: fonts.body,
            fontWeight: 600,
            fontSize: 22,
            color: "#fff",
            padding: "9px 18px",
            borderRadius: 14,
            backgroundColor: `rgba(${BRAND}, 0.94)`,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              backgroundColor: "#fff",
            }}
          />
          {timeline.roles[f.role]}
        </div>
      )}
    </AbsoluteFill>
  );
};

// Volumes live in mix.json, which export.mjs also reads, so the preview and the exported MP4 match.
export const Demo: React.FC<Props> = ({ timeline }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  useThemeFonts(timeline?.theme);
  if (!timeline) return null;
  const { parts } = timeline;

  // Music sits under the screen parts and comes up on the title cards.
  const here = timeline.frames[frame];
  const onCard = Boolean(here && "card" in here);
  const under = here && "stinger" in here ? here.under : undefined;
  const music =
    (onCard ? mix.musicOnCards : mix.music) *
    interpolate(
      frame,
      [
        0,
        mix.fadeInSeconds * fps,
        durationInFrames - mix.fadeOutSeconds * fps,
        durationInFrames,
      ],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );

  return (
    <ThemeContext.Provider value={timeline.theme ?? DEFAULT_THEME}>
      <AbsoluteFill style={{ backgroundColor: "#fff" }}>
        <Screen timeline={timeline} />
        {under !== undefined && <Screen timeline={timeline} index={under} />}
        {timeline.cards.map((card) => (
          <Sequence
            key={card.from}
            from={card.from}
            durationInFrames={card.durationInFrames}
            premountFor={fps}
            name={card.title}
          >
            {card.kind === "end" && card.endCard ? (
              <EndCard card={card} />
            ) : (
              <TitleCard card={card} parts={parts} />
            )}
          </Sequence>
        ))}
        {(timeline.stingers ?? []).map((card) => (
          <Sequence
            key={`st${card.from}`}
            from={card.from}
            durationInFrames={card.durationInFrames}
            premountFor={fps}
            name={`Stinger: ${card.title}`}
          >
            <Stinger card={card} />
          </Sequence>
        ))}
        <Audio
          src={staticFile("audio/music.mp3")}
          loop
          volume={music}
          name="Music"
        />
        {timeline.sounds.map((s, i) => (
          <Audio
            key={`${s.frame}-${i}`}
            from={s.frame}
            src={staticFile(s.file)}
            volume={mix.effects[s.kind] * (s.volume ?? 1)}
            premountFor={fps}
            name={s.kind}
          />
        ))}
        {timeline.frames[frame] === undefined && (
          <AbsoluteFill style={{ backgroundColor: "#fff" }} />
        )}
      </AbsoluteFill>
    </ThemeContext.Provider>
  );
};
