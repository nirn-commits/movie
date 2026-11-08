import React from "react";
import { AbsoluteFill, Img, interpolate } from "remotion";
import { CONFIG } from "../config";
import { Bg, CardRain, Chara, Curtains, Sign, Typo, faceOf, randRange } from "../components/kit";
import { Needle } from "../components/Needle";
import { Stage } from "../components/Stage";
import { getImage } from "../lib/assets";
import { beatIndexAt, beatPhase, beatsIn, snap } from "../lib/beats";
import { Shot, between, onBeat } from "../lib/shots";
import { ShhSpot } from "./Intro";

const W = CONFIG.width;
const H = CONFIG.height;
const Q = CONFIG.cue;

/** Bridge：全部消す。3枚目の背中だけ、黒、ほぼ静止、歌詞は下に小さく。カットなし（フェードはここだけ） */
export const Bridge: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.bridge;
  const img = getImage(CONFIG.cast.third);
  const zoom = interpolate(t, [s.from, s.to], [1, 1.06]);
  const h = H;
  const w = (h * (img.width ?? 1)) / (img.height ?? 1);
  const line = Q.bridgeLines.find((l) => t >= l.from && t < l.to);
  const fade = line
    ? interpolate(t, [line.from, line.from + 0.4, line.to - 0.4, line.to], [0, 1, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;
  return (
    <AbsoluteFill>
      <Bg color="black" />
      <Needle opacity={0.08} />
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Img
          src={img.src}
          style={{
            position: "absolute",
            left: (W - w) / 2,
            top: 0,
            width: w,
            height: h,
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)",
          }}
        />
      </AbsoluteFill>
      {line ? <Typo text={line.text} y={H * 0.93} size={34} color="white" font="body" tracking={0.25} opacity={fade} /> : null}
    </AbsoluteFill>
  );
};

/** Instrumental Break：キャラなし。針とカードとカーテンだけが暴れる。背景は 黒→ピンク→白 */
export const Break: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.brk;
  const bg = t < Q.brkPink ? "black" : t < Q.brkWhite ? "pink" : "white";
  const bars = beatsIn(s.from, s.to, 4);
  const bar = Math.max(0, bars.filter((b) => t >= b).length - 1);
  const bi = beatIndexAt(t);
  const ph = beatPhase(t);
  const dir = bi % 2 ? 1 : -1;
  const swing = dir * Math.pow(1 - ph, 2);
  // 1小節ごとに針の置き方を変える（ハードカット）
  const layouts = [
    { x: W * 0.5, y: H * 0.5, scale: 1.7 },
    { x: W * 0.3, y: H * 0.55, scale: 2.4 },
    { x: W * 0.7, y: H * 0.45, scale: 2.4 },
    { x: W * 0.5, y: H * 0.5, scale: 4.2 },
  ];
  const L = layouts[bar % layouts.length];
  const open = bar % 4 === 3 ? 0.6 : bar % 2 ? 0.25 : 0;
  const rainSeed = 10 + Math.floor(bar / 2);
  const rainStart = bars[Math.floor(bar / 2) * 2] ?? s.from;
  const fan = getImage("prop-cards-fan");
  const fanShow = bar % 2 === 1;
  return (
    <AbsoluteFill>
      <Bg color={bg} />
      <Needle opacity={0.95} x={L.x} y={L.y} scale={L.scale} />
      {fanShow ? (
        <Img
          src={fan.src}
          style={{
            position: "absolute",
            width: 560,
            left: randRange(bar, W * 0.05, W * 0.6),
            top: randRange(bar + 9, H * 0.05, H * 0.5),
            transform: `rotate(${randRange(bar + 3, -30, 30) + (t - s.from) * 90 * dir}deg) scale(${1 + 0.15 * Math.pow(1 - ph, 3)})`,
          }}
        />
      ) : null}
      <CardRain t={t - rainStart} seed={rainSeed} count={30} speed={900} />
      <Curtains swingL={swing} swingR={-swing} open={open} />
    </AbsoluteFill>
  );
};

const ALL = [
  "chara-sing-shout-cutout",
  "chara-point-angry-cutout",
  "chara-reach-grin-cutout",
  "chara-surprised-hands-cutout",
  "chara-fullbody-arms-crossed-cutout",
  "chara-shh-smile-cutout",
  "chara-smile-tear-cutout",
];
const BGS = ["pink", "black", "white"] as const;

/** Final Chorus：全素材を速く回し、「そんな私を見抜いてよ！」で初めて4枚目を長く止める */
export const Final: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.final;
  const holdAt = snap(Q.minuku);
  const grinAt = snap(Q.minuku - 0.86);
  const cuts = beatsIn(s.from, grinAt);
  const shots: Shot[] = cuts.map((at, i) => {
    const id = ALL[(i * 3) % (ALL.length - 1)]; // 4枚目（涙の笑顔）はここでは出さない
    const seed = i * 13 + 5;
    const close = i % 3 === 1;
    return {
      at,
      bg: BGS[i % 3],
      render: () => (
        <Chara
          id={id}
          h={close ? 2800 : 1250}
          cx={randRange(seed, W * 0.3, W * 0.7)}
          cy={close ? H * 0.5 : H * 0.62}
          focus={close ? faceOf(id) : [0.5, 0.5]}
          flip={i % 2 === 1}
          rotate={randRange(seed + 1, -6, 6)}
        />
      ),
    };
  });
  // ニヤリ（直前の顔）→ 4枚目に切り替わる瞬間に、ニヤリが消える
  shots.push(onBeat(grinAt, () => <Chara id="chara-reach-grin-cutout" h={4200} cy={H * 0.5} focus={faceOf("chara-reach-grin")} />, "pink"));
  shots.push({
    at: holdAt,
    bg: "white",
    render: (local) => {
      const h = interpolate(local, [0, s.to - holdAt], [1300, 1900]);
      return (
        <>
          <Chara id={`${CONFIG.cast.fourth}-cutout`} h={h} cy={H * 0.5} focus={faceOf(CONFIG.cast.fourth)} />
          <Typo text="そんな私を見抜いてよ！" y={H * 0.9} size={78} color="black" outline="white" />
        </>
      );
    },
  });
  let line = "";
  for (const l of Q.finalLines) if (t >= l.at) line = l.text;
  return (
    <Stage
      t={t}
      shots={shots}
      bg="pink"
      needleOpacity={0.3}
      needleScale={1.6}
      overlay={t < grinAt && line ? <Typo text={line} y={H * 0.88} size={110} color="white" outline="black" /> : null}
    />
  );
};

/** Outro：好き／嫌いの反転がだんだん遅くなり、「……あ。今の、なし。」で最初の「しーっ」に戻る */
export const Outro: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.outro;
  // 歌の「好き嫌い好き」に合わせたあと、間隔を伸ばしていく
  const flips = [...Q.outroSuki.slice(1), 164.6, 165.7, 167.1, 169.0, 171.4];
  if (t >= Q.imano2) {
    const zoom = interpolate(t, [Q.imano2, s.to], [1.12, 1.0]);
    return (
      <AbsoluteFill>
        <ShhSpot zoom={zoom} />
        {between(t, Q.imano2, Q.imano2 + 3.2, <Typo text="……あ。今の、なし。" y={H * 0.92} size={40} color="white" font="body" tracking={0.2} />)}
      </AbsoluteFill>
    );
  }
  let n = 0;
  for (const f of flips) if (t >= f) n++;
  const like = n % 2 === 0;
  return (
    <AbsoluteFill>
      <Bg color="white" />
      <Needle opacity={0.14} />
      <Chara id="chara-reach-grin-cutout" h={1100} cx={W * 0.78} cy={H * 0.58} />
      <Chara id="chara-reach-grin-cutout" h={1100} cx={W * 0.22} cy={H * 0.58} flip />
      <Sign t={t} flips={flips} x={W * 0.5} y={H * 0.48} h={760} flipSec={interpolate(t, [s.from, Q.imano2], [0.12, 0.4])} />
      {t < 163.74 ? <Typo text={like ? "好き" : "嫌い"} x={like ? W * 0.5 : W * 0.5} y={H * 0.9} size={90} color={like ? "pink" : "black"} /> : null}
      {between(t, 163.74, Q.imano1, <Typo text="好きって……" y={H * 0.9} size={70} font="body" />)}
      {between(t, Q.imano1, Q.imano1 + 2.2, <Typo text="今の、なし" y={H * 0.9} size={70} font="body" />)}
    </AbsoluteFill>
  );
};

/** 最後のピアノ和音で黒に切ってタイトルカード */
export const TitleCard: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.title;
  const show = t >= snap(s.from + 0.45);
  return (
    <AbsoluteFill>
      <Bg color="black" />
      {show ? (
        <>
          <Typo text={CONFIG.title} y={H * 0.47} size={120} color="white" tracking={0.12} />
          <div style={{ position: "absolute", left: W * 0.5 - 90, top: H * 0.58, width: 180, height: 6, background: CONFIG.color.pink }} />
        </>
      ) : null}
    </AbsoluteFill>
  );
};
