import React, { useContext } from "react";
import { Easing, interpolate, spring, useVideoConfig } from "remotion";
import { exitOf } from "./Headline";
import { clamp, CodeSpan, glass, ThemeContext } from "./theme";

type Kind = "key" | "string" | "number" | "bool" | "keyword" | "tag" | "punct" | "text";

// One alternation, tried left to right at each position (sticky).
const TOKEN = new RegExp(
  [
    "(\"(?:[^\"\\\\]|\\\\.)*\"|'(?:[^'\\\\]|\\\\.)*'|`[^`]*`)", // 1 string
    "(\\b(?:true|false|null|undefined)\\b)", // 2 bool
    "(\\b\\d[\\d_.]*\\b)", // 3 number
    "(\\b(?:const|let|var|return|import|from|export|default|function|new|await|async)\\b)", // 4 keyword
    "((?:<\\/?)[A-Za-z][\\w.]*)", // 5 tag
    "([A-Za-z_$][\\w$]*(?=\\s*[:=](?!=)))", // 6 key / attribute
    "([{}()[\\],:;.<>/=?!*+\\-|&])", // 7 punctuation
    "([A-Za-z_$][\\w$]*|\\s+|.)", // 8 anything else
  ].join("|"),
  "y",
);

/** Light syntax colouring: [char, kind] pairs, so the chip can reveal it character by character. */
const colourise = (src: string): { ch: string; kind: Kind }[] => {
  const out: { ch: string; kind: Kind }[] = [];
  TOKEN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while (TOKEN.lastIndex < src.length && (m = TOKEN.exec(src))) {
    const kinds: Kind[] = ["string", "bool", "number", "keyword", "tag", "key", "punct", "text"];
    let kind: Kind = "text";
    for (let g = 1; g <= 8; g++)
      if (m[g] !== undefined) {
        kind = kinds[g - 1];
        break;
      }
    if (kind === "tag") {
      // "<Table" -> "<" punctuation + "Table" tag
      const lead = m[0].match(/^<\/?/)![0];
      for (const ch of lead) out.push({ ch, kind: "punct" });
      for (const ch of m[0].slice(lead.length)) out.push({ ch, kind: "tag" });
    } else for (const ch of m[0]) out.push({ ch, kind });
  }
  return out;
};

/** A floating code chip that types itself out; replaced with a quick swap by the next one. */
export const CodeChip: React.FC<{ a: CodeSpan; frame: number }> = ({ a, frame }) => {
  const { brand, fonts } = useContext(ThemeContext);
  const { fps } = useVideoConfig();
  const delay = a.swapIn ? 5 : 0;
  const local = frame - a.from - delay;
  if (local < 0) return null;
  const exit = exitOf(frame, a);
  const enter = spring({ frame: local, fps, config: { damping: 16, stiffness: 170, mass: 0.8 } });
  const chars = colourise(a.text);
  const typed = Math.floor(
    interpolate(local, [6, 6 + a.typeFrames], [0, chars.length], {
      ...clamp,
      easing: Easing.bezier(0.3, 0.1, 0.4, 1),
    }),
  );
  const typing = typed < chars.length;
  // Solid while typing, then a slow blink.
  const caretOn = typing || Math.floor((local - 6 - a.typeFrames) / 16) % 2 === 0;
  const colour: Record<Kind, string> = {
    key: "#8fd0ff",
    string: `rgb(${brand})`,
    number: "#ffb86b",
    bool: "#f793d8",
    keyword: "#c3a6ff",
    tag: "#ffd479",
    punct: "rgba(226,232,240,0.5)",
    text: "#eef1f5",
  };
  const top = a.at.indexOf("top") === 0;
  const left = a.at.indexOf("left") >= 0;
  // Takes no room (negative margin), so the chip never reflows while typing.
  const caret = (
    <span
      key="caret"
      style={{
        display: "inline-block",
        width: "0.55em",
        height: "1.1em",
        marginRight: "-0.55em",
        verticalAlign: "-0.22em",
        borderRadius: 2,
        backgroundColor: `rgba(${brand}, ${caretOn ? 0.85 : 0})`,
        boxShadow: caretOn ? `0 0 14px rgba(${brand}, 0.6)` : undefined,
      }}
    />
  );

  return (
    <div
      style={{
        position: "absolute",
        [top ? "top" : "bottom"]: 56,
        [left ? "left" : "right"]: 56,
        maxWidth: 1380,
        transformOrigin: `${top ? "top" : "bottom"} ${left ? "left" : "right"}`,
        opacity: interpolate(enter, [0, 0.6], [0, 1], clamp) * (1 - exit),
        scale: String(interpolate(enter, [0, 1], [0.9, 1]) - exit * 0.05),
        translate: `0px ${(1 - enter) * (top ? -18 : 18) + exit * (top ? -14 : 14)}px`,
        filter: exit > 0.01 ? `blur(${exit * 6}px)` : undefined,
      }}
    >
      <div
        style={{
          ...glass(brand, 0.2),
          borderRadius: 18,
          padding: "16px 26px 18px 22px",
          display: "flex",
          gap: 18,
          alignItems: "flex-start",
        }}
      >
        <div
          style={{
            width: 4,
            alignSelf: "stretch",
            borderRadius: 999,
            backgroundColor: `rgb(${brand})`,
            boxShadow: `0 0 16px rgba(${brand}, 0.7)`,
          }}
        />
        <pre
          style={{
            margin: 0,
            fontFamily: fonts.mono,
            fontWeight: 500,
            fontSize: 27,
            lineHeight: 1.5,
            whiteSpace: "pre-wrap",
            color: colour.text,
          }}
        >
          {chars.map((c, i) => (
            <React.Fragment key={i}>
              {i === typed && caret}
              <span style={{ color: colour[c.kind], opacity: i < typed ? 1 : 0 }}>{c.ch}</span>
            </React.Fragment>
          ))}
          {typed >= chars.length && caret}
        </pre>
      </div>
    </div>
  );
};
