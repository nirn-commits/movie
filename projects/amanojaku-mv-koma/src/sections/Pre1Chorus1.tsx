import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { CONFIG } from "../config";
import { AREA, Box, H, W, bbox, centerBox, cols, diag, irregular, rect } from "../koma/geom";
import { Bubble, Chara, Kanji, Narration, Panel, StageBg, TextRing, charaGeom } from "../koma/parts";
import { collide, easeOut, flips, integrate, page, pageAt, pop, slowZoom } from "../koma/anim";
import { snap } from "../lib/beats";

const K = CONFIG.cast;
const Q = CONFIG.cue;
const C = CONFIG.color;

/** 表の私（07 そのまま）と裏の私（07 左右反転）の顔 */
const Omote: React.FC<{ w: number; h: number; crop?: "bust" | "face" }> = ({ w, h, crop = "bust" }) => <Chara id={K.m07} w={w} h={h} crop={crop} align={0.6} />;
const Ura: React.FC<{ w: number; h: number; crop?: "bust" | "face" }> = ({ w, h, crop = "bust" }) => <Chara id={K.m07} w={w} h={h} crop={crop} flip align={0.4} />;

/** 吹き出し同士の衝突：表は右から、裏は左から中央へ */
const Clash: React.FC<{ t: number; omote: { at: number; text: string }; ura: { at: number; text: string }; y?: number; size?: number }> = ({
  t,
  omote,
  ura,
  y = H * 0.5,
  size = 52,
}) => {
  const a = collide(t, omote.at, 0.16);
  const b = collide(t, ura.at, 0.16);
  const showB = t >= ura.at;
  // 表は先に中央付近へ、裏が来たら押し合う
  const ox = W * 0.5 + 170 + (1 - a.p) * 700 - (showB ? b.p * 40 : 0) + b.shake;
  const ux = W * 0.5 - 170 - (1 - b.p) * 700 + (showB ? b.p * 40 : 0) - b.shake;
  return (
    <>
      <Bubble x={ox} y={y} text={omote.text} size={size} spiky={showB} rotate={showB ? 4 : 0} />
      {showB ? <Bubble x={ux} y={y + 20} text={ura.text} size={size} ura spiky rotate={-5} /> : null}
    </>
  );
};

/** Pre-Chorus 1：コマが 2→4→6 と増えて小さくなる（焦り）。掛け合いは吹き出しの衝突 */
export const Pre1: React.FC<{ t: number }> = ({ t }) => {
  const p = Q.pre1;
  const [acchi, kocchi, docchi, socchi] = p.acchi;
  const six = irregular(6, 7);
  const pages = [
    // 2コマ：あっち？（こっち！）
    page(acchi, () => {
      const [l, r] = cols([1, 1]);
      return (
        <>
          <Panel poly={rect(l)} fill="black">
            {(w, h) => (
              <>
                <Ura w={w} h={h} />
                <Kanji ch="此" w={w} h={h} color="pink" outline="black" ruby="こっち" dx={-w * 0.26} dy={-h * 0.18} scale={t >= kocchi ? 0.6 * pop(t, kocchi, 0.2) : 0.001} />
              </>
            )}
          </Panel>
          <Panel poly={rect(r)}>
            {(w, h) => (
              <>
                <Omote w={w} h={h} />
                <Kanji ch="彼" w={w} h={h} color="pink" outline="black" ruby="あっち" dx={w * 0.26} dy={-h * 0.18} scale={0.6 * pop(t, acchi, 0.2)} />
              </>
            )}
          </Panel>
          <Clash t={t} omote={{ at: acchi, text: "あっち？" }} ura={{ at: kocchi, text: "こっち！" }} y={H * 0.78} />
        </>
      );
    }),
    // 4コマ：どっち？（そっち！）
    page(docchi, () => {
      const four = irregular(4, 3);
      return (
        <>
          {four.map((b, i) => (
            <Panel key={i} poly={rect(b)} fill={i % 2 ? "black" : "white"}>
              {(w, h) =>
                i === 0 ? (
                  <Kanji ch="何" w={w} h={h} ruby="どっち" color="pink" />
                ) : i === 3 ? (
                  <Kanji ch="其" w={w} h={h} ruby="そっち" color="pink" scale={t >= socchi ? pop(t, socchi, 0.2) : 0.001} />
                ) : i === 1 ? (
                  <Ura w={w} h={h} />
                ) : (
                  <Omote w={w} h={h} />
                )
              }
            </Panel>
          ))}
          <Clash t={t} omote={{ at: docchi, text: "どっち？" }} ura={{ at: socchi, text: "そっち！" }} y={H * 0.5} size={46} />
        </>
      );
    }),
    // 6コマ：待って、ちょっと、まだ決めないで！（05 の不機嫌フキダシ）
    page(p.matte, () => {
      const big = six.reduce((m, b, i) => (b.w * b.h > six[m].w * six[m].h ? i : m), 0);
      return (
        <>
          {six.map((b, i) => (
            <Panel key={i} poly={rect(b)} fill={i === big ? "white" : i % 3 === 0 ? "halftone" : i % 2 ? "black" : "white"}>
              {(w, h) =>
                i === big ? (
                  <Chara id={K.m05} w={w} h={h} crop="bust" align={0.35} />
                ) : i % 2 ? (
                  <Ura w={w} h={h} />
                ) : i % 3 === 0 ? null : (
                  <Omote w={w} h={h} />
                )
              }
            </Panel>
          ))}
          <Bubble x={six[big].x + six[big].w * 0.78} y={six[big].y + six[big].h * 0.48} text={"待って、\nちょっと、\nまだ決めないで！"} size={36} spiky tail={[six[big].x + six[big].w * 0.45, six[big].y + six[big].h * 0.3]} />
        </>
      );
    }),
    // 好き？（嫌い！）嫌い？（……好き？）：好／嫌のタイポが反転して入れ替わる
    page(p.suki[0], () => {
      const f = flips(t, p.suki.slice(1), 0.18);
      const swapped = f.count % 2 === 1;
      const words = [
        { at: p.suki[0], text: "好き？", ura: false },
        { at: p.suki[1], text: "嫌い！", ura: true },
        { at: p.suki[2], text: "嫌い？", ura: false },
        { at: p.suki[3], text: "……好き？", ura: true },
      ];
      const cur = [...words].reverse().find((w) => t >= w.at) ?? words[0];
      const [kA, kB] = [six[1], six[4]];
      return (
        <>
          {six.map((b, i) => {
            const isA = b === kA;
            const isB = b === kB;
            const ch = isA ? (swapped ? "嫌" : "好") : swapped ? "好" : "嫌";
            return (
              <Panel key={i} poly={rect(b)} fill={isA || isB ? (ch === "好" ? "pink" : "black") : i % 2 ? "black" : "white"}>
                {(w, h) =>
                  isA || isB ? (
                    <Kanji ch={ch} w={w} h={h} color="white" flipX={f.sx} />
                  ) : i % 2 ? (
                    <Ura w={w} h={h} />
                  ) : (
                    <Omote w={w} h={h} />
                  )
                }
              </Panel>
            );
          })}
          <Bubble x={cur.ura ? W * 0.3 : W * 0.7} y={H * 0.52} text={cur.text} size={60} ura={cur.ura} spiky={cur.ura} scale={pop(t, cur.at, 0.18)} />
        </>
      );
    }),
    // あらら、舌がもつれちゃった：コマが少しずつずれる
    page(p.arara, (l) => (
      <>
        {six.map((b, i) => (
          <Panel key={i} poly={rect(b)} fill={i % 2 ? "black" : "white"} rotate={(i % 2 ? 1 : -1) * Math.min(3, l * 4)}>
            {(w, h) => (i % 2 ? <Ura w={w} h={h} crop="bust" /> : <Omote w={w} h={h} crop="bust" />)}
          </Panel>
        ))}
        <Narration x={W * 0.5} y={H * 0.42} text="あらら、舌がもつれちゃった" size={44} horizontal />
      </>
    )),
    // ねえ、正解なんて／誰が決めたの？：小さなコマが並ぶ
    page(p.seikai, (l) => (
      <>
        {six.map((b, i) => (
          <Panel key={i} poly={rect(b)} fill={i === 2 ? "white" : "halftone"}>
            {(w, h) => (i === 2 ? <Chara id={K.m07} w={w} h={h} crop="face" zoom={slowZoom(l, 0.012)} /> : null)}
          </Panel>
        ))}
        <Narration x={AREA.x + AREA.w - 40} y={AREA.y + 30} text={"ねえ、\n正解なんて"} size={42} />
        {t >= p.dare ? <Narration x={AREA.x + 360} y={H * 0.5} text={"誰が\n決めたの？"} size={42} /> : null}
      </>
    )),
  ];
  return <AbsoluteFill style={{ backgroundColor: C.white }}>{pageAt(t, pages)}</AbsoluteFill>;
};

/** 回る「あまのじゃく」の角度（心の針の代わり） */
export const ringAngle = (t: number) =>
  integrate(t, [
    { from: 0, v: 40 },
    { from: 49.6, v: 220 },
    { from: 63.9, v: 0 },
    { from: 65.2, v: 60 },
    { from: 104.04, v: 0 },
    { from: 116.4, v: 300 },
    { from: 145.36, v: 260 },
    { from: 157.6, v: 0 },
  ]);

/** コマ破り：キャラの一部（手）だけ枠の外に描く */
const Breakout: React.FC<{ box: Box; id: string; crop: "bust" | "full"; region: { x0: number; y0: number; x1: number; y1: number }; align?: number }> = ({
  box,
  id,
  crop,
  region,
  align = 0.5,
}) => {
  const g = charaGeom(id, box.w, box.h, crop, false, align);
  const x = box.x + g.left;
  const y = box.y + g.top;
  const clip = `inset(${region.y0 * 100}% ${(1 - region.x1) * 100}% ${(1 - region.y1) * 100}% ${region.x0 * 100}%)`;
  return <Img src={g.img.src} style={{ position: "absolute", left: x, top: y, width: g.iw, height: g.ih, clipPath: clip }} />;
};

/** Chorus 1：斜め割り。対義語タイポ対決の本番。コマ破り1回目（01 の手） */
export const Chorus1: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.chorus1;
  const c = Q.ch1;
  const ang = ringAngle(t);
  const honki = snap(c.honki);
  const pages = [
    // あまのじゃくじゃく：01 の伸ばした手が枠を破る
    page(s.from, () => {
      const polys = diag([[0.44, 0.3]]);
      const right = bbox(polys[1]);
      return (
        <>
          <Panel poly={polys[0]} fill="black">
            {(w, h) => (
              <>
                <StageBg w={w} h={h} part={[0.5, 0.45]} zoom={1.2} />
                <TextRing w={w} h={h} angle={ang} color="white" />
              </>
            )}
          </Panel>
          <Panel poly={polys[1]} fill="pink">
            {(w, h) => <Chara id={K.m01} w={w} h={h} crop="bust" align={0.48} />}
          </Panel>
          <Breakout box={right} id={K.m01} crop="bust" region={CONFIG.reachHand} align={0.48} />
          <Bubble x={W * 0.88} y={H * 0.72} text={"あまのじゃく\nじゃく"} size={50} spiky />
        </>
      );
    }),
    // ああ、ややこしい！：表と裏がぐるぐる
    page(c.ayaya, () => {
      const polys = diag([[0.38, 0.28], [0.72, 0.62]]);
      return (
        <>
          <Panel poly={polys[0]}>{(w, h) => <Chara id={K.m02} w={w} h={h} crop="face" />}</Panel>
          <Panel poly={polys[1]} fill="black">
            {(w, h) => (
              <>
                <Kanji ch="表" w={w} h={h} color="white" rotate={ang * 0.5} dx={-w * 0.12} scale={0.7} />
                <Kanji ch="裏" w={w} h={h} color="pink" rotate={-ang * 0.5} dx={w * 0.12} dy={h * 0.15} scale={0.7} />
              </>
            )}
          </Panel>
          <Panel poly={polys[2]}>{(w, h) => <Chara id={K.m02} w={w} h={h} crop="face" flip />}</Panel>
          <Bubble x={W * 0.5} y={H * 0.16} text={"ああ、\nややこしい！"} size={44} spiky />
        </>
      );
    }),
    page(c.shio, (l) => {
      const polys = diag([[0.55, 0.42]]);
      return (
        <>
          <Panel poly={polys[0]} fill="black">
            {(w, h) => (
              <>
                <StageBg w={w} h={h} part={[0.2, 0.5]} zoom={1.8} />
                <Chara id={K.m02} w={w} h={h} crop="bust" zoom={slowZoom(l)} />
              </>
            )}
          </Panel>
          <Panel poly={polys[1]} fill="halftonePink" />
          <Narration x={W * 0.86} y={AREA.y + 60} text={"甘い言葉に\n塩を振って"} size={46} />
        </>
      );
    }),
    // 笑って 怒って また笑って：笑 × 泣 の衝突
    page(c.waratte, () => {
      const polys = diag([[0.3, 0.2], [0.8, 0.7]]);
      const cl = collide(t, c.waratte, 0.2);
      const second = t >= snap(c.waratte + 1.2);
      return (
        <>
          <Panel poly={polys[0]}>{(w, h) => <Chara id={K.m02} w={w} h={h} crop="face" align={0.6} />}</Panel>
          <Panel poly={polys[1]} fill="pink">
            {(w, h) => (
              <>
                <Kanji ch="泣" w={w} h={h} color="black" dx={-w * 0.22 - (1 - cl.p) * w * 0.4 + cl.shake} scale={second ? 0.45 : 0.75} rotate={second ? -20 : 0} />
                <Kanji ch="笑" w={w} h={h} color="white" outline="black" dx={w * 0.22 + (1 - cl.p) * w * 0.4 - cl.shake} scale={second ? 1.0 : 0.75} />
              </>
            )}
          </Panel>
          <Panel poly={polys[2]}>{(w, h) => <Chara id={K.m02} w={w} h={h} crop="face" flip align={0.4} />}</Panel>
          <Narration x={W * 0.5} y={H * 0.84} text="笑って　怒って　また笑って" size={40} horizontal />
        </>
      );
    }),
    // 心の針がくるくる回る：「あまのじゃく」の文字自体が回る
    page(c.hari, () => {
      const polys = diag([[0.62, 0.52]]);
      return (
        <>
          <Panel poly={polys[0]} fill="black">
            {(w, h) => (
              <>
                <TextRing w={w} h={h} angle={ang} color="pink" r={Math.min(w, h) * 0.42} />
                <TextRing w={w} h={h} angle={-ang * 1.4} color="white" r={Math.min(w, h) * 0.26} />
              </>
            )}
          </Panel>
          <Panel poly={polys[1]}>{(w, h) => <Chara id={K.m02} w={w} h={h} crop="bust" align={0.55} />}</Panel>
          <Narration x={AREA.x + 200} y={AREA.y + 40} text={"心の針が\nくるくる回る"} size={42} />
        </>
      );
    }),
    // とんだ茶番も上等よ：ステージのコマ背景
    page(c.chaban, () => {
      const polys = diag([[0.3, 0.38], [0.7, 0.62]]);
      return (
        <>
          <Panel poly={polys[0]} fill="black">{(w, h) => <StageBg w={w} h={h} part={[0.1, 0.5]} zoom={2.2} />}</Panel>
          <Panel poly={polys[1]} fill="black">
            {(w, h) => (
              <>
                <StageBg w={w} h={h} part={[0.5, 0.45]} zoom={1.4} />
                <Chara id={K.m02} w={w} h={h} crop="bust" />
              </>
            )}
          </Panel>
          <Panel poly={polys[2]} fill="black">{(w, h) => <StageBg w={w} h={h} part={[0.9, 0.5]} zoom={2.2} />}</Panel>
          <Bubble x={W * 0.18} y={H * 0.68} text={"とんだ茶番も\n上等よ"} size={44} tail={[W * 0.4, H * 0.5]} />
        </>
      );
    }),
    // 嘘の裏側、裏の裏：表→裏→表
    page(c.uso, () => {
      const polys = diag([[0.5, 0.36]]);
      const f = flips(t, [snap(c.uso + 0.4), snap(c.uso + 1.2)], 0.2);
      const ch = f.count === 1 ? "裏" : "表";
      return (
        <>
          <Panel poly={polys[0]} fill={ch === "裏" ? "black" : "white"}>
            {(w, h) => <Kanji ch={ch} w={w} h={h} color={ch === "裏" ? "pink" : "black"} flipX={f.sx} />}
          </Panel>
          <Panel poly={polys[1]}>{(w, h) => <Chara id={K.m02} w={w} h={h} crop="face" flip={f.count === 1} />}</Panel>
          <Narration x={W * 0.93} y={AREA.y + 40} text={"嘘の裏側、\n裏の裏"} size={42} />
        </>
      );
    }),
    // ひっくり返せば恋になる？：コマごと上下反転
    page(c.hikkuri, () => {
      const polys = diag([[0.42, 0.58]]);
      const r = 180 * easeOut((t - c.hikkuri) / 0.3);
      return (
        <>
          <Panel poly={polys[0]} fill="pink" rotate={r}>
            {(w, h) => <Chara id={K.m02} w={w} h={h} crop="bust" />}
          </Panel>
          <Panel poly={polys[1]}>{(w, h) => <Chara id={K.m02} w={w} h={h} crop="face" flip />}</Panel>
          <Bubble x={W * 0.78} y={H * 0.3} text={"ひっくり返せば\n恋になる？"} size={42} tail={[W * 0.7, H * 0.5]} />
        </>
      );
    }),
    // なんてね ×3：斜めのコマが1つずつ増える
    page(c.nantene[0], () => {
      const polys = diag([[0.36, 0.28], [0.7, 0.62]]);
      const n = c.nantene.filter((x) => t >= x).length;
      return (
        <>
          {polys.slice(0, n).map((pp, i) => (
            <Panel key={i} poly={pp} fill={i === 1 ? "pink" : "white"}>
              {(w, h) => <Chara id={K.m02} w={w} h={h} crop="face" flip={i === 1} />}
            </Panel>
          ))}
          {polys.slice(0, n).map((pp, i) => {
            const b = bbox(pp);
            return <Bubble key={`b${i}`} x={b.x + b.w * 0.5} y={b.y + b.h * 0.82} text={"なんてね" + (i === 2 ? "！" : "、")} size={40} ura={i === 1} scale={pop(t, c.nantene[i], 0.2)} />;
          })}
        </>
      );
    }),
    // ……本気にした？：全コマが消え、中央に小さな1コマだけ（06）
    page(c.honki, () => {
      const b = centerBox(400, 300, W / 2, H * 0.46);
      return (
        <>
          <Panel poly={rect(b)}>{(w, h) => <Chara id={K.m06} w={w} h={h} crop="face" />}</Panel>
          {t >= honki + 0.43 ? <Bubble x={W * 0.5 + 330} y={H * 0.36} text={"……本気に\nした？"} size={30} tail={[W * 0.5 + 170, H * 0.42]} /> : null}
        </>
      );
    }),
  ];
  return <AbsoluteFill style={{ backgroundColor: C.white }}>{pageAt(t, pages)}</AbsoluteFill>;
};
