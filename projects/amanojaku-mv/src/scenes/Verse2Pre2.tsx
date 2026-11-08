import React from "react";
import { interpolate } from "remotion";
import { CONFIG } from "../config";
import { Chara, Sign, Typo, faceOf } from "../components/kit";
import { Stage } from "../components/Stage";
import { beatsIn } from "../lib/beats";
import { Shot, after, onBeat } from "../lib/shots";

const W = CONFIG.width;
const H = CONFIG.height;
const Q = CONFIG.cue;
const INVERT = "invert(1) hue-rotate(180deg)"; // 反転色（裏）
const POSES = [
  "chara-surprised-hands-cutout",
  "chara-point-angry-cutout",
  "chara-reach-grin-cutout",
  "chara-fullbody-arms-crossed-cutout",
  "chara-sing-shout-cutout",
  "chara-smile-tear-cutout",
];

/** 横一列に n 人並べる（数タイポとわざとズラす） */
const Row: React.FC<{ n: number; h?: number; invert?: boolean; offset?: number }> = ({ n, h = 640, invert = true, offset = 0 }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const id = POSES[(i + offset) % POSES.length];
      return (
        <Chara
          key={i}
          id={id}
          h={h}
          cx={W * ((i + 0.5) / n)}
          cy={H * 0.6}
          focus={faceOf(id)}
          flip={i % 2 === 1}
          filter={invert ? INVERT : undefined}
        />
      );
    })}
  </>
);

/** Verse 2：黒背景に反転色。数字タイポをズラして、数が合わない違和感を出す */
export const Verse2: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.verse2;
  const shots: Shot[] = [
    onBeat(s.from, () => (
      <>
        <Chara id="chara-fullbody-arms-crossed-cutout" h={1040} cx={W * 0.62} filter={INVERT} />
        <Typo text={"猫をかぶって\n犬を呼ぶ"} x={W * 0.24} y={H * 0.5} size={96} color="white" />
      </>
    )),
    // 二枚舌なら → 3人並ぶ
    onBeat(Q.nimai, () => (
      <>
        <Typo text="2" x={W * 0.18} y={H * 0.3} size={520} color="pink" />
        <Row n={3} />
        <Typo text="二枚舌なら" x={W * 0.72} y={H * 0.12} size={84} color="white" />
      </>
    )),
    // 三枚目 → 2人しかいない
    onBeat(Q.sanmai, () => (
      <>
        <Typo text="3" x={W * 0.84} y={H * 0.36} size={560} color="pink" rotate={8} />
        <Row n={2} offset={2} h={760} />
        <Typo text="三枚目" x={W * 0.2} y={H * 0.12} size={100} color="white" />
      </>
    )),
    // 七変化 → 6人
    onBeat(Q.nanahenge, () => (
      <>
        <Typo text="7" x={W * 0.5} y={H * 0.36} size={640} color="pink" />
        <Row n={6} h={520} offset={1} />
        <Typo text="口から出まかせ七変化" y={H * 0.1} size={80} color="white" />
      </>
    )),
    // あら、数が合わないわ：番号が飛んでいる
    onBeat(Q.kazu, () => (
      <>
        <Row n={5} h={560} offset={3} />
        {["1", "2", "3", "5", "8"].map((d, i) => (
          <Typo key={i} text={d} x={W * ((i + 0.5) / 5) + (i % 2 ? 40 : -50)} y={H * 0.16} size={140} color={d === "5" || d === "8" ? "pink" : "white"} />
        ))}
        <Typo text="あら、数が合わないわ" y={H * 0.92} size={76} color="pink" outline="black" />
      </>
    )),
  ];
  return <Stage t={t} shots={shots} bg="black" needleOpacity={0.2} />;
};

/** 裏の私を3人重ねる */
const Crowd: React.FC<{ k: number; text?: string; dark: boolean }> = ({ k, text, dark }) => {
  const front = POSES[k % POSES.length];
  const backs = [1, 2, 3].map((j) => POSES[(k + j * 2) % POSES.length]);
  const xs = [W * 0.22, W * 0.5, W * 0.78];
  return (
    <>
      {backs.map((id, j) => (
        <Chara key={j} id={id} h={1150} cx={xs[j] + ((k + j) % 2 ? 40 : -40)} cy={H * 0.55} focus={faceOf(id)} flip opacity={0.55} filter={INVERT} />
      ))}
      <Chara id={front} h={1350} cx={W * 0.5} cy={H * 0.56} focus={faceOf(front)} flip={k % 2 === 1} />
      {text ? <Typo text={text} y={H * 0.88} size={104} color={dark ? "white" : "black"} outline={dark ? "black" : "white"} /> : null}
    </>
  );
};

const PRE2_LINES = [
  { at: CONFIG.sections.pre2.from, text: "お行儀よくして損をして" },
  { at: Q.orikou, text: "お利口ぶって馬鹿をみて" },
  { at: Q.sonnayo, text: "そんな世の中、知ってるわ" },
  { at: Q.shiranpuri, text: "だから今日だけ知らんぷり" },
  { at: Q.datte[0], text: "だって！" },
  { at: Q.datte[1], text: "（なんで？）" },
  { at: Q.datte[2], text: "なんで！" },
  { at: Q.datte[3], text: "（だって！）" },
  { at: Q.doudou, text: "堂々巡りの論理武装" },
  { at: Q.chotto[0], text: "ちょっと！" },
  { at: Q.chotto[1], text: "（もっと！）" },
  { at: Q.chotto[2], text: "もっと！" },
  { at: Q.chotto[3], text: "（ちょっと！）" },
  { at: Q.hanashi, text: "もう、話にならないじゃない！" },
];

/** Pre-Chorus 2：裏の私を3人に増やして重ね、切り替えは最速（1拍ごと）。「約束なんて破るためにあるの？」で札にヒビ */
export const Pre2: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.pre2;
  const beats = beatsIn(s.from, Q.yakusoku);
  let text = "";
  for (const l of PRE2_LINES) if (t >= l.at) text = l.text;
  const shots: Shot[] = beats.map((at, k) => ({
    at,
    bg: k % 2 ? "black" : "white",
    render: () => <Crowd k={k} text={text} dark={k % 2 === 1} />,
  }));
  shots.push(
    onBeat(
      Q.yakusoku,
      () => {
        const crack = interpolate(t, [Q.crack, Q.crack + 0.35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <>
            <Sign t={t} flips={[]} x={W * 0.5} y={H * 0.48} h={820} cracked={crack} />
            <Typo text="ねえ、約束なんて" x={W * 0.2} y={H * 0.3} size={64} font="body" />
            {after(t, Q.yaburu, <Typo text="破るためにあるの？" x={W * 0.8} y={H * 0.72} size={64} font="body" />)}
          </>
        );
      },
      "white",
    ),
  );
  return <Stage t={t} shots={shots} bg="white" needleOpacity={0.16} />;
};
