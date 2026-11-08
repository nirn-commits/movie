import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { CONFIG } from "../config";
import { Chara, Sign, Typo, faceOf } from "../components/kit";
import { Needle } from "../components/Needle";
import { Stage } from "../components/Stage";
import { beatPhase } from "../lib/beats";
import { between, onBeat } from "../lib/shots";

const W = CONFIG.width;
const H = CONFIG.height;
const Q = CONFIG.cue;
const FULL = `${CONFIG.cast.fullBody}-cutout`;
const ANGRY = "chara-point-angry-cutout";
const SURPRISED = "chara-surprised-hands-cutout";
const GRIN = "chara-reach-grin-cutout";

/** Verse 1：白背景、元の全身絵。「左向き」で本当に反転、「本音は企業秘密」で口元に一瞬寄る */
export const Verse1: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.verse1;
  const shots = [
    onBeat(s.from, () => (
      <>
        <Typo text={CONFIG.title} y={H * 0.5} size={190} color="pink" tracking={0.06} />
        <Chara id={FULL} h={1040} />
      </>
    )),
    onBeat(17.8, () => <Chara id={FULL} h={2100} focus={faceOf(FULL)} cy={H * 0.36} />),
    onBeat(19.5, () => (
      <>
        <Typo text="あまのじゃく" x={W * 0.27} y={H * 0.5} size={150} vertical />
        <Chara id={FULL} h={1040} cx={W * 0.66} />
      </>
    )),
    onBeat(21.2, () => <Chara id={FULL} h={3400} focus={faceOf(FULL)} cy={H * 0.48} />),
    onBeat(Q.rightRight, () => (
      <>
        <Typo text={"右向け\n右なら"} x={W * 0.3} y={H * 0.5} size={150} />
        <Chara id={FULL} h={1040} cx={W * 0.68} />
      </>
    )),
    // 「左向き」：本当に左右反転させる
    onBeat(Q.left, () => (
      <>
        <Typo text="左向き" x={W * 0.7} y={H * 0.5} size={210} color="pink" vertical />
        <Chara id={FULL} h={1040} cx={W * 0.32} flip />
      </>
    )),
    onBeat(Q.uragaeshi, () => (
      <>
        <Typo text="ご機嫌いかがと" x={W * 0.3} y={H * 0.16} size={80} />
        <Typo text="裏返し" x={W * 0.3} y={H * 0.5} size={260} rotate={180} color="pink" tracking={0.1} />
        <Chara id={FULL} h={1040} cx={W * 0.72} flip />
      </>
    )),
    onBeat(Q.aisou, () => (
      <>
        <Chara id={FULL} h={2000} focus={faceOf(FULL)} cy={H * 0.33} />
        <Typo text="愛想笑いはお手のもの" y={H * 0.86} size={84} outline="white" />
      </>
    )),
    // 「本音は」：口元のアップに一瞬だけ寄る
    onBeat(Q.honne, () => <Chara id={FULL} h={6400} focus={faceOf(FULL, "mouth")} cy={H * 0.5} />),
    onBeat(Q.kigyou + 0.4, () => (
      <>
        <Typo text="でも本音は" x={W * 0.3} y={H * 0.3} size={90} />
        <Typo text="企業秘密" x={W * 0.32} y={H * 0.55} size={190} color="pink" rotate={-6} />
        <Chara id={FULL} h={1040} cx={W * 0.72} />
      </>
    )),
  ];
  return <Stage t={t} shots={shots} bg="white" needleOpacity={0.12} />;
};

/** 表（右・白）と裏（左・黒、左右反転）の分割画面。針は両方の半分を通して背後に見える */
const Split: React.FC<{
  front: string;
  back: string;
  speaker?: "front" | "back" | "both";
  bounce?: number;
  frontText?: string;
  backText?: string;
  centerText?: string;
}> = ({ front, back, speaker = "both", bounce = 0, frontText, backText, centerText }) => {
  const big = 1250;
  const small = 1000;
  const hf = (speaker === "back" ? small : big) * (1 + bounce);
  const hb = (speaker === "front" ? small : big) * (1 + bounce);
  const half: React.CSSProperties = { position: "absolute", top: 0, width: W / 2, height: H, overflow: "hidden" };
  return (
    <>
      <div style={{ ...half, left: 0, background: CONFIG.color.black }}>
        <Needle opacity={0.14} x={W / 2} />
        <Chara id={back} h={hb} cx={W * 0.3} cy={H * 0.62} focus={faceOf(back)} flip />
        {backText ? <Typo text={backText} x={W * 0.25} y={H * 0.14} size={78} color="white" /> : null}
      </div>
      <div style={{ ...half, left: W / 2, background: CONFIG.color.white }}>
        <Needle opacity={0.14} x={0} />
        <Chara id={front} h={hf} cx={W * 0.2} cy={H * 0.62} focus={faceOf(front)} />
        {frontText ? <Typo text={frontText} x={W * 0.25} y={H * 0.14} size={78} color="black" /> : null}
      </div>
      <div style={{ position: "absolute", left: W / 2 - 5, top: 0, width: 10, height: H, background: CONFIG.color.pink }} />
      {centerText ? <Typo text={centerText} y={H * 0.87} size={96} color="pink" outline="white" /> : null}
    </>
  );
};

/** Pre-Chorus 1：画面分割で表と裏が言い合う */
export const Pre1: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.pre1;
  const bounce = 0.03 * Math.pow(1 - beatPhase(t), 3);
  const words = ["あっち？", "（こっち！）", "どっち？", "（そっち！）"];
  const shots = [
    onBeat(s.from, () => <Split front={ANGRY} back={ANGRY} speaker="front" frontText="あれもこれも欲張って" />),
    onBeat(Q.doremo, () => <Split front={ANGRY} back={ANGRY} speaker="back" backText="どれもそれも退屈で" />),
    onBeat(32.48, () => <Split front={SURPRISED} back={SURPRISED} centerText="予定調和の三拍子" />),
    onBeat(Q.ippaku, () => <Split front={GRIN} back={GRIN} bounce={bounce} centerText="一拍余計に踊りましょ" />),
    // あっち？こっち？どっち？そっち？：一語ごとに表と裏を全画面で切り替える
    ...Q.acchi.map((at, i) => {
      const isBack = i % 2 === 1;
      return onBeat(
        at,
        () => (
          <>
            <Chara id={ANGRY} h={1500} focus={faceOf(ANGRY)} cx={isBack ? W * 0.62 : W * 0.38} cy={H * 0.42} flip={isBack} />
            <Typo text={words[i]} x={isBack ? W * 0.22 : W * 0.78} y={H * 0.5} size={170} color={isBack ? "white" : "pink"} vertical />
          </>
        ),
        isBack ? "black" : "white",
      );
    }),
    onBeat(Q.matte, () => <Split front={SURPRISED} back={SURPRISED} centerText="待って、ちょっと、まだ決めないで！" />),
    // 好き？（嫌い！）嫌い？（……好き？）：札をパタパタ反転。カッコ内は裏の私が左から割り込む
    onBeat(
      Q.suki[0],
      () => {
        const [a, b, c, d] = Q.suki;
        const backIn = interpolate(t, [b - 0.05, b + 0.08, c - 0.06, c + 0.04, d - 0.05, d + 0.08], [-760, 0, 0, -760, -760, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        const word = t < b ? "好き？" : t < c ? "（嫌い！）" : t < d ? "嫌い？" : "（……好き？）";
        const isBack = word.startsWith("（");
        return (
          <>
            <Chara id={GRIN} h={1250} cx={W * 0.7} cy={H * 0.58} focus={faceOf(GRIN)} />
            <Sign t={t} flips={[b, d]} x={W * 0.42} y={H * 0.5} h={620} rotate={-8} />
            <Chara id={ANGRY} h={1400} cx={W * 0.12 + backIn} cy={H * 0.5} focus={faceOf(ANGRY)} flip />
            {between(
              t,
              a,
              Q.arara,
              <Typo
                text={word}
                x={isBack ? W * 0.3 : W * 0.44}
                y={isBack ? H * 0.12 : H * 0.9}
                size={120}
                color={isBack ? "black" : "pink"}
                rotate={isBack ? -4 : 0}
                outline="white"
              />,
            )}
          </>
        );
      },
      "white",
    ),
    onBeat(
      Q.arara,
      () => (
        <>
          <Chara id={SURPRISED} h={1500} focus={faceOf(SURPRISED)} cy={H * 0.4} />
          <Typo text="あらら、" x={W * 0.2} y={H * 0.3} size={150} color="pink" rotate={-12} />
          <Typo text="舌がもつれちゃった" y={H * 0.88} size={96} outline="white" />
        </>
      ),
      "white",
    ),
    // 「正解なんて誰が決めたの？」：少し引いて余白を作る
    onBeat(
      Q.seikai,
      (local) => {
        const z = interpolate(local, [0, 6], [1, 0.94], { extrapolateRight: "clamp" });
        return (
          <AbsoluteFill style={{ transform: `scale(${z})` }}>
            <Chara id={ANGRY} h={560} cx={W * 0.74} cy={H * 0.66} />
            <Typo text="ねえ、" x={W * 0.14} y={H * 0.3} size={52} align="left" font="body" />
            <Typo text="正解なんて誰が決めたの？" x={W * 0.14} y={H * 0.4} size={60} align="left" font="body" />
          </AbsoluteFill>
        );
      },
      "white",
    ),
  ];
  return <Stage t={t} shots={shots} bg="white" needleOpacity={0.12} />;
};
