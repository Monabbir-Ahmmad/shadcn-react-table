// The annotation kit (project addition): overlays drawn above the take and below the cursor.
// Spans come from prepare.mjs (timeline.annotations) with element boxes in source px; each frame
// maps them through that frame's camera, so they stay on the element while the camera moves.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Bubble } from "./Bubble";
import { Callout } from "./Callout";
import { CodeChip } from "./CodeChip";
import { Headline } from "./Headline";
import { Keycaps } from "./Keycaps";
import { Spotlight } from "./Spotlight";
import { Stat } from "./Stat";
import { Annotation, Camera } from "./theme";

export { Bubble, CodeChip, Callout, Headline, Keycaps, Spotlight, Stat };
export * from "./theme";
export { EndCard, Stinger, TitleCard } from "./Cards";
export type { CardData } from "./Cards";

// Lower layers first: the spotlight dims the page, headlines and stats sit on top.
const ORDER: Annotation["kind"][] = ["spotlight", "callout", "code", "keys", "stat", "headline", "bubble"];

/** Spotlights only: drawn under the click ripples. */
export const AnnotationsUnder: React.FC<{
  list: Annotation[];
  frame: number;
  cam: Camera;
}> = ({ list, frame, cam }) => (
  <AbsoluteFill>
    {list
      .filter((a) => a.kind === "spotlight" && frame >= a.from && frame < a.to)
      .map((a) =>
        a.kind === "spotlight" ? <Spotlight key={`s${a.from}`} a={a} frame={frame} cam={cam} /> : null,
      )}
  </AbsoluteFill>
);

export const Annotations: React.FC<{
  list: Annotation[];
  frame: number;
  cam: Camera;
  /** Camera of any output frame, for choosing a callout's side once. */
  camAt: (frame: number) => Camera;
}> = ({ list, frame, cam, camAt }) => {
  const live = list
    .filter((a) => a.kind !== "spotlight" && frame >= a.from && frame < a.to)
    .sort((p, q) => ORDER.indexOf(p.kind) - ORDER.indexOf(q.kind) || p.from - q.from);
  return (
    <AbsoluteFill>
      {live.map((a) => {
        const key = `${a.kind}-${a.from}`;
        switch (a.kind) {
          case "headline":
            return <Headline key={key} a={a} frame={frame} />;
          case "stat":
            return <Stat key={key} a={a} frame={frame} />;
          case "callout":
            return <Callout key={key} a={a} frame={frame} cam={cam} firstCam={camAt(a.from)} />;
          case "bubble":
            return <Bubble key={key} a={a} frame={frame} cam={cam} />;
          case "keys":
            return <Keycaps key={key} a={a} frame={frame} cam={cam} />;
          case "code":
            return <CodeChip key={key} a={a} frame={frame} />;
          default:
            return null;
        }
      })}
    </AbsoluteFill>
  );
};
