import React from "react";
import { AbsoluteFill } from "remotion";
import { CONFIG } from "../config";
import { AREA, H, W, bbox, centerBox, cols, irregular, rect, squares } from "../koma/geom";
import { Bubble, Chara, Kanji, Narration, Panel } from "../koma/parts";
import { clamp01, collide, flips, page, pageAt, pop, slowZoom } from "../koma/anim";
import { beatIndexAt, beatsIn, snap } from "../lib/beats";

const K = CONFIG.cast;
const Q = CONFIG.cue;
const C = CONFIG.color;
const FONT = `"${CONFIG.fonts.main.family}"`;

/** 擬音タイポ（Pa／Da） */
const Onomatopoeia: React.FC<{ text: string; x: number; y: number; size: number; rotate?: number; scale?: number; color?: "pink" | "black" | "white" }> = ({
  text,
  x,
  y,
  size,
  rotate = 0,
  scale = 1,
  color = "pink",
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`,
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      color: C[color],
      WebkitTextStroke: `${size / 22}px ${C.black}`,
      paintOrder: "stroke fill",
      fontStyle: "italic",
      whiteSpace: "nowrap",
      lineHeight: 1,
    }}
  >
    {text}
  </div>
);

/** Post-Chorus：正方形の等分コマがリズムで跳ねる。Pa／Da は擬音タイポとして大きく */
export const Post: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.post;
  const p = Q.post;
  const sq = squares(2, 4);
  const bi = beatIndexAt(t);
  const beatsAll = beatsIn(s.from, s.to);
  const lastBeat = [...beatsAll].reverse().find((b) => t >= b) ?? s.from;
  const hot = ((bi % 8) + 8) % 8; // 拍ごとに跳ねるコマ
  const order = [0, 5, 2, 7, 1, 4, 3, 6];
  const isDa = t >= p.da;
  const content = (i: number, w: number, h: number) => {
    if (t >= p.yosomi && i === 5) return <Chara id={K.m02} w={w} h={h} crop="face" />;
    if (i === 1 || i === 6) return <Chara id={K.m02} w={w} h={h} crop={i === 1 ? "face" : "bust"} flip={i === 6} />;
    if (i === 3 || i === 4) return <Chara id={K.m05} w={w} h={h} crop="face" flip={i === 4} />;
    return null;
  };
  const fills = ["pink", "white", "black", "white", "white", "halftone", "white", "pink"] as const;
  const quiet = t >= p.acchimo;
  return (
    <AbsoluteFill style={{ backgroundColor: C.white }}>
      {sq.map((b, i) => {
        const sc = !quiet && order[hot] === i ? pop(t, lastBeat, 0.1, 0.35) : 1;
        const bb = { x: b.x + (b.w * (1 - sc)) / 2, y: b.y + (b.h * (1 - sc)) / 2, w: b.w * sc, h: b.h * sc };
        return (
          <Panel key={i} poly={rect(bb)} fill={quiet && i !== 5 ? "white" : fills[i]}>
            {(w, h) => content(i, w, h)}
          </Panel>
        );
      })}
      {!quiet ? (
        <>
          <Onomatopoeia text={isDa ? "Da!" : "Pa!"} x={sq[0].x + sq[0].w / 2} y={sq[0].y + sq[0].h / 2} size={230} rotate={-10} scale={pop(t, lastBeat, 0.25)} color="white" />
          <Onomatopoeia text={isDa ? "Da-da-da" : "Pa-pa-pa"} x={W * 0.5} y={H * 0.5} size={170} rotate={-6} scale={pop(t, lastBeat, 0.08)} />
          <Onomatopoeia text={isDa ? "dadadadada!" : "parapapapa!"} x={sq[7].x + sq[7].w / 2 - 120} y={sq[7].y + sq[7].h * 0.6} size={110} rotate={8} color="white" />
        </>
      ) : (
        <>
          <Narration x={W * 0.5} y={AREA.y + 6} text="あっちもこっちもお好きにどうぞ" size={42} horizontal />
          {t >= p.yosomi ? <Bubble x={sq[6].x + sq[6].w * 0.5} y={sq[6].y + sq[6].h * 0.5} text={"でも、\nよそ見は\nしないでね？"} size={40} tail={[sq[5].x + sq[5].w * 0.7, sq[5].y + sq[5].h * 0.5]} /> : null}
        </>
      )}
    </AbsoluteFill>
  );
};

/** 縦割りのページ */
const Strips: React.FC<{ ratios: number[]; render: (i: number, w: number, h: number) => React.ReactNode; fills?: (i: number) => "white" | "black" | "pink" | "halftone"; borderColor?: (i: number) => "black" | "white" }> = ({
  ratios,
  render,
  fills,
  borderColor,
}) => (
  <>
    {cols(ratios).map((b, i) => (
      <Panel key={i} poly={rect(b)} fill={fills ? fills(i) : "white"} borderColor={borderColor ? borderColor(i) : "black"}>
        {(w, h) => render(i, w, h)}
      </Panel>
    ))}
  </>
);

/** Verse 2：縦割りコマ。数字タイポ「1、2、3、7」と数え間違える。1コマだけ色を反転（裏の私） */
export const Verse2: React.FC<{ t: number }> = ({ t }) => {
  const v = Q.v2;
  const base = K.base;
  const numbers = (shown: string[]) => (
    <Strips
      ratios={[1, 1, 1, 1]}
      fills={(i) => (i === 3 ? "pink" : "white")}
      render={(i, w, h) => (
        <>
          <Chara id={base} w={w} h={h} crop={i === 3 ? "face" : "bust"} flip={i % 2 === 1} />
          {shown[i] ? <Kanji ch={shown[i]} w={w} h={h * 0.5} color={i === 3 ? "white" : "pink"} outline="black" dy={h * 0.55} scale={pop(t, [v.nimai, v.nimai, v.sanmai, v.nana][i], 0.25)} /> : null}
        </>
      )}
    />
  );
  const pages = [
    page(v.neko, (l) => (
      <>
        <Strips
          ratios={[1, 1, 1]}
          fills={(i) => (i === 1 ? "halftone" : "white")}
          render={(i, w, h) => (i === 1 ? null : <Chara id={base} w={w} h={h} crop={i === 0 ? "full" : "bust"} flip={i === 2} zoom={slowZoom(l)} />)}
        />
        <Narration x={W * 0.56} y={AREA.y + 40} text={"猫をかぶって\n犬を呼ぶ"} size={46} />
      </>
    )),
    page(v.nimai, () => (
      <>
        {numbers(t >= v.nana ? ["1", "2", "3", "7"] : t >= v.sanmai ? ["1", "2", "3", ""] : ["1", "2", "", ""])}
        <Narration x={W * 0.98 - 20} y={AREA.y + 20} text={t >= v.nana ? "口から出まかせ\n七変化" : "二枚舌なら\n三枚目"} size={38} />
      </>
    )),
    page(v.kazu, () => (
      <>
        {numbers(["1", "2", "3", "7"])}
        <Bubble x={W * 0.5} y={H * 0.3} text={"あら、\n数が\n合わないわ"} size={44} tail={[W * 0.62, H * 0.45]} />
      </>
    )),
    page(v.gyougi, (l) => (
      <>
        <Strips ratios={[1, 2, 1]} fills={(i) => (i === 1 ? "white" : "halftone")} render={(i, w, h) => (i === 1 ? <Chara id={base} w={w} h={h} crop="bust" zoom={slowZoom(l)} /> : null)} />
        <Narration x={W * 0.74} y={AREA.y + 40} text={"お行儀よくして\n損をして"} size={40} />
      </>
    )),
    // 「お利口ぶって馬鹿をみて」：1コマだけ色を反転（裏の私のコマ）
    page(v.orikou, () => (
      <>
        <Strips
          ratios={[1, 1, 1, 1]}
          fills={(i) => (i === 2 ? "black" : "white")}
          borderColor={() => "black"}
          render={(i, w, h) =>
            i === 2 ? (
              <div style={{ position: "absolute", inset: 0, filter: "invert(1) hue-rotate(180deg)" }}>
                <Chara id={K.m07} w={w} h={h} crop="bust" flip />
              </div>
            ) : (
              <Chara id={i === 1 ? K.m07 : base} w={w} h={h} crop="bust" />
            )
          }
        />
        <Narration x={W * 0.3} y={AREA.y + 30} text="お利口ぶって" size={40} />
        <Bubble x={cols([1, 1, 1, 1])[2].x + 230} y={H * 0.78} text={"馬鹿を\nみて"} size={44} ura />
      </>
    )),
    page(v.sonna, (l) => (
      <>
        <Strips ratios={[2, 1]} fills={(i) => (i === 1 ? "pink" : "white")} render={(i, w, h) => (i === 0 ? <Chara id={K.m05} w={w} h={h} crop="bust" zoom={slowZoom(l)} /> : null)} />
        <Narration x={W * 0.93} y={AREA.y + 60} text={"そんな世の中、\n知ってるわ"} size={44} />
      </>
    )),
    page(v.dakara, () => (
      <>
        <Strips ratios={[1, 1, 1]} render={(i, w, h) => <Chara id={K.m05} w={w} h={h} crop={i === 1 ? "face" : "bust"} flip={i !== 0} />} />
        <Bubble x={W * 0.17} y={H * 0.72} text={"だから今日だけ\n知らんぷり"} size={40} tail={[W * 0.25, H * 0.45]} />
      </>
    )),
  ];
  return <AbsoluteFill style={{ backgroundColor: C.white }}>{pageAt(t, pages)}</AbsoluteFill>;
};

/** Pre-Chorus 2：コマが傾き、重なり始める。「約束なんて破るためにあるの？」で枠にヒビ */
export const Pre2: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.pre2;
  const p = Q.pre2;
  // 時間とともに傾きと重なりが増す
  const k = clamp01((t - s.from) / (p.yakusoku - s.from));
  const tilted = (n: number, seed: number) =>
    irregular(n, seed).map((b, i) => {
      const grow = 1 + 0.12 * k;
      const bb = { x: b.x - (b.w * (grow - 1)) / 2 + (i % 2 ? 30 : -30) * k, y: b.y - (b.h * (grow - 1)) / 2, w: b.w * grow, h: b.h * grow };
      return { box: bb, rot: (i % 2 ? 1 : -1) * (2 + 6 * k) * (1 + (i % 3) * 0.3) };
    });
  const pages = [
    // だって！（なんで？）なんで！（だって！）
    page(p.datte[0], () => {
      const ps = tilted(3, 5);
      const f = flips(t, p.datte.slice(1), 0.16);
      const omoteCh = f.count % 2 === 0 ? "因" : "何";
      const words = ["だって！", "なんで？", "なんで！", "だって！"];
      const idx = p.datte.filter((x) => t >= x).length - 1;
      const ura = idx % 2 === 1;
      return (
        <>
          {ps.map(({ box, rot }, i) => (
            <Panel key={i} poly={rect(box)} rotate={rot} fill={i === 1 ? "black" : "white"}>
              {(w, h) =>
                i === 0 ? (
                  <Kanji ch={omoteCh} w={w} h={h} ruby={omoteCh === "因" ? "だって" : "なんで"} color="pink" flipX={f.sx} />
                ) : i === 1 ? (
                  <Chara id={K.m07} w={w} h={h} crop="face" flip />
                ) : (
                  <Chara id={K.m07} w={w} h={h} crop="face" />
                )
              }
            </Panel>
          ))}
          <Bubble x={ura ? W * 0.32 : W * 0.7} y={H * 0.5} text={words[Math.max(0, idx)]} size={70} ura={ura} spiky scale={pop(t, p.datte[Math.max(0, idx)], 0.2)} />
        </>
      );
    }),
    page(p.doudou, (l) => {
      const ps = tilted(4, 9);
      return (
        <>
          {ps.map(({ box, rot }, i) => (
            <Panel key={i} poly={rect(box)} rotate={rot + l * 20 * (i % 2 ? 1 : -1)} fill={i % 2 ? "halftone" : "white"}>
              {(w, h) => (i % 2 ? null : <Chara id={K.m07} w={w} h={h} crop="bust" flip={i === 2} />)}
            </Panel>
          ))}
          <Narration x={W * 0.5} y={H * 0.44} text="堂々巡りの論理武装" size={44} horizontal />
        </>
      );
    }),
    // ちょっと！（もっと！）もっと！（ちょっと！）：少 × 多
    page(p.chotto[0], () => {
      const ps = tilted(4, 13);
      const idx = p.chotto.filter((x) => t >= x).length - 1;
      const moreWins = idx % 2 === 1;
      const cl = collide(t, p.chotto[0], 0.16);
      const words = ["ちょっと！", "もっと！", "もっと！", "ちょっと！"];
      return (
        <>
          {ps.map(({ box, rot }, i) => (
            <Panel key={i} poly={rect(box)} rotate={rot} fill={i === 0 ? "pink" : i === 3 ? "black" : "white"}>
              {(w, h) =>
                i === 0 ? (
                  <>
                    <Kanji ch="少" w={w} h={h} ruby="ちょっと" color="white" dx={-w * 0.2 - (1 - cl.p) * w * 0.3 + cl.shake} scale={moreWins ? 0.45 : 0.85} />
                    <Kanji ch="多" w={w} h={h} ruby="もっと" color="black" dx={w * 0.2 + (1 - cl.p) * w * 0.3 - cl.shake} scale={moreWins ? 0.85 : 0.45} />
                  </>
                ) : i === 3 ? (
                  <Chara id={K.m07} w={w} h={h} crop="face" flip />
                ) : (
                  <Chara id={K.m05} w={w} h={h} crop="face" flip={i === 2} />
                )
              }
            </Panel>
          ))}
          <Bubble x={idx % 2 ? W * 0.3 : W * 0.72} y={H * 0.72} text={words[Math.max(0, idx)]} size={58} ura={idx % 2 === 1} spiky scale={pop(t, p.chotto[Math.max(0, idx)], 0.2)} />
        </>
      );
    }),
    // もう、話にならないじゃない！：05 の不機嫌フキダシ。コマは重なり合う
    page(p.hanashi, () => {
      const ps = tilted(5, 21);
      const big = ps.reduce((m, q, i) => (q.box.w * q.box.h > ps[m].box.w * ps[m].box.h ? i : m), 0);
      return (
        <>
          {ps.map(({ box, rot }, i) => (
            <Panel key={i} poly={rect(box)} rotate={rot * 1.4} fill={i === big ? "white" : i % 2 ? "black" : "halftone"}>
              {(w, h) => (i === big ? <Chara id={K.m05} w={w} h={h} crop="bust" align={0.4} /> : null)}
            </Panel>
          ))}
          <Bubble x={ps[big].box.x + ps[big].box.w * 0.8} y={ps[big].box.y + ps[big].box.h * 0.45} text={"もう、\n話に\nならない\nじゃない！"} size={42} spiky />
        </>
      );
    }),
    // ねえ、約束なんて／破るためにあるの？：そのコマの枠にヒビ
    page(p.yakusoku, (l) => {
      const b = centerBox(1100, 760, W / 2, H / 2);
      const crack = clamp01((t - p.crack) / 0.4);
      return (
        <>
          <Panel poly={rect(b)} rotate={-4} crack={crack}>
            {(w, h) => <Chara id={K.m07} w={w} h={h} crop="bust" align={0.6} zoom={slowZoom(l, 0.01)} />}
          </Panel>
          <Narration x={b.x + 80} y={b.y - 10} text={"ねえ、\n約束なんて"} size={44} />
          {t >= p.yaburu ? <Narration x={b.x + b.w + 120} y={b.y + 300} text={"破るために\nあるの？"} size={44} /> : null}
        </>
      );
    }),
  ];
  void bbox;
  return <AbsoluteFill style={{ backgroundColor: C.white }}>{pageAt(t, pages)}</AbsoluteFill>;
};

export { snap };
