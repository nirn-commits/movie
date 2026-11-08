import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { CONFIG } from "../config";
import { CardRain, Chara, Typo, faceOf, randRange } from "../components/kit";
import { Stage } from "../components/Stage";
import { beatPhase, beatsIn, snap } from "../lib/beats";
import { Shot, after, onBeat } from "../lib/shots";

const W = CONFIG.width;
const H = CONFIG.height;
const Q = CONFIG.cue;
const FIRST = `${CONFIG.cast.first}-cutout`;
const GRIN = "chara-reach-grin-cutout";

/** サビの画角パターン（2拍ごとに切り替え） */
const framings = (i: number) => {
  const k = i % 6;
  if (k === 0) return { h: 1250, cx: W * 0.5, cy: H * 0.62, focus: [0.5, 0.5] as [number, number], flip: false };
  if (k === 1) return { h: 2600, cx: W * 0.46, cy: H * 0.46, focus: faceOf(FIRST), flip: false };
  if (k === 2) return { h: 1500, cx: W * 0.68, cy: H * 0.5, focus: faceOf(FIRST), flip: false };
  if (k === 3) return { h: 1500, cx: W * 0.32, cy: H * 0.5, focus: faceOf(FIRST), flip: true };
  if (k === 4) return { h: 4200, cx: W * 0.5, cy: H * 0.55, focus: faceOf(FIRST, "mouth"), flip: false };
  return { h: 1250, cx: W * 0.5, cy: H * 0.62, focus: [0.5, 0.5] as [number, number], flip: true };
};

const LINES: { at: number; text: string; to?: number }[] = [
  { at: CONFIG.sections.chorus1.from, text: "あまのじゃくじゃく" },
  { at: Q.ayayakoshii, text: "あー、ややこしい" },
  { at: Q.hari, text: "心の針がくるくる回る" },
  { at: Q.chaban, text: "とんだ茶番も上等よ" },
  { at: Q.uso, text: "嘘の裏側 裏の裏" },
  { at: Q.hikkuri, text: "ひっくり返せば恋になる" },
];

/** 区間の歌詞を、その行の時間だけ出す */
const lineAt = (t: number, lines: { at: number; text: string }[], until: number) => {
  let cur: { at: number; text: string } | null = null;
  for (const l of lines) if (t >= l.at) cur = l;
  if (!cur || t >= until) return null;
  // 前の行から 1.6 秒以上たっていて次の行がないときは消す
  return cur;
};

/** Chorus 1：ピンク背景に1枚目。針が高速回転、「とんだ茶番」でトランプ、「……本気にした？」で1拍止めて顔へ */
export const Chorus1: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.chorus1;
  const freezeAt = snap(Q.honki);
  const freezeEnd = snap(Q.honki + 0.45);
  const cutTimes = beatsIn(s.from, Q.nantene, 2);
  const shots: Shot[] = cutTimes.map((at, i) => ({
    at,
    render: () => {
      const f = framings(i);
      const upside = t >= Q.hikkuri && t < Q.nantene; // 「ひっくり返せば」で上下も反転
      return <Chara id={FIRST} h={f.h} cx={f.cx} cy={f.cy} focus={f.focus} flip={f.flip} rotate={upside ? 180 : 0} />;
    },
  }));
  // なんてね ×3：位置を変えた3カット
  const nantene = [Q.nantene, 62.38, 63.12];
  nantene.forEach((at, i) =>
    shots.push(
      onBeat(at, () => (
        <>
          <Chara id={FIRST} h={1700} cx={[W * 0.35, W * 0.65, W * 0.5][i]} cy={H * 0.52} focus={faceOf(FIRST)} flip={i === 1} />
          <Typo text="なんてね" x={[W * 0.75, W * 0.25, W * 0.5][i]} y={[H * 0.3, H * 0.7, H * 0.86][i]} size={150} color="white" outline="black" rotate={[-6, 5, 0][i]} />
        </>
      )),
    ),
  );
  // 「……本気にした？」：全部止めて（1拍）、そのあと顔に寄って囁く
  shots.push({
    at: freezeAt,
    render: () => (
      <>
        <Chara id={FIRST} h={1700} cx={W * 0.5} cy={H * 0.52} focus={faceOf(FIRST)} />
        <Typo text="なんてね" x={W * 0.5} y={H * 0.86} size={150} color="white" outline="black" />
      </>
    ),
  });
  shots.push({
    at: freezeEnd,
    bg: "black",
    render: (local) => {
      const z = interpolate(local, [0, 1.2], [1, 1.12], { extrapolateRight: "clamp" });
      return (
        <AbsoluteFill style={{ transform: `scale(${z})` }}>
          <Chara id={FIRST} h={4200} cx={W * 0.5} cy={H * 0.5} focus={faceOf(FIRST, "mouth")} />
          <Typo text="……本気にした？" x={W * 0.5} y={H * 0.9} size={52} color="pink" outline="black" font="heavy" tracking={0.2} />
        </AbsoluteFill>
      );
    },
  });

  const line = lineAt(t, LINES, Q.nantene);
  const rain = t >= Q.chaban && t < Q.hikkuri + 0.8;
  const frozen = t >= freezeAt;
  return (
    <Stage
      t={t}
      shots={shots}
      bg="pink"
      needleOpacity={0.3}
      needleScale={1.5}
      overlay={
        <>
          {rain && !frozen ? <CardRain t={t - Q.chaban} seed={3} count={34} /> : null}
          {line && !frozen ? <Typo text={line.text} y={H * 0.88} size={110} color="white" outline="black" /> : null}
        </>
      }
    />
  );
};

/** Post-Chorus：スキャットは絵を動かさず、スケールのバウンスと「Pa-pa-pa」の文字だけ。「よそ見」で視線アップ */
export const Post: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.post;
  const scatFrom = s.from; // 囁きのあと
  const bounce = 1 + 0.05 * Math.pow(1 - beatPhase(t), 4);
  const scatBeats = beatsIn(scatFrom, Q.acchimo);
  const shown = scatBeats.filter((b) => t >= b);
  const words = shown.map((b, i) => {
    const seed = Math.round(b * 100);
    const text = t >= Q.papapa && b >= Q.papapa ? "Pa" : i % 3 === 2 ? "ra" : "Ta";
    return (
      <Typo
        key={i}
        text={`${text}-`}
        x={randRange(seed, W * 0.08, W * 0.92)}
        y={randRange(seed + 1, H * 0.1, H * 0.9)}
        size={randRange(seed + 2, 70, 170)}
        color={i % 2 ? "pink" : "black"}
        rotate={randRange(seed + 3, -14, 14)}
      />
    );
  });
  const neene = [Q.neene, 73.78, 74.54];
  const shots: Shot[] = [
    {
      at: scatFrom,
      render: () => (
        <AbsoluteFill style={{ transform: `scale(${bounce})` }}>
          {words.slice(-14)}
          <Chara id={GRIN} h={1150} cy={H * 0.56} />
          <Typo text="Pa-pa-pa" y={H * 0.88} size={150} color="pink" outline="white" />
        </AbsoluteFill>
      ),
    },
    onBeat(Q.acchimo, () => (
      <AbsoluteFill style={{ transform: `scale(${bounce})` }}>
        <Chara id={GRIN} h={1150} cy={H * 0.56} />
        <Typo text={"あっちもこっちも\nお好きにどうぞ"} x={W * 0.2} y={H * 0.5} size={84} />
      </AbsoluteFill>
    )),
    // 「よそ見はしないでね？」：視線のアップ
    onBeat(Q.yosomi, () => (
      <>
        <Chara id={GRIN} h={7000} cy={H * 0.5} focus={faceOf(GRIN)} />
        <Typo text="よそ見はしないでね？" y={H * 0.9} size={72} color="white" outline="black" />
      </>
    )),
    ...neene.map((at, i) =>
      onBeat(at, () => (
        <>
          <Chara id={GRIN} h={[5200, 6200, 7600][i]} cy={H * 0.5} focus={faceOf(GRIN)} flip={i === 1} />
          <Typo text="ねえ" x={[W * 0.2, W * 0.8, W * 0.5][i]} y={[H * 0.2, H * 0.8, H * 0.15][i]} size={130} color="pink" outline="white" />
        </>
      )),
    ),
    onBeat(75.8, (local) => (
      <>
        <Chara id={GRIN} h={1150} cy={H * 0.56} />
        {after(local, 0, <Typo text="ねえ、ねえ、ねえ" y={H * 0.9} size={64} />)}
      </>
    )),
  ];
  return <Stage t={t} shots={shots} bg="white" needleOpacity={0.14} />;
};
