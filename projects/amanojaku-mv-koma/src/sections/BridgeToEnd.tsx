import React from "react";
import { AbsoluteFill, Img, interpolate } from "remotion";
import { CONFIG } from "../config";
import { AREA, H, W, bbox, centerBox, cols, diag, diagRows, full, irregular, rect, rows, shrinkBox, squares } from "../koma/geom";
import { Bubble, Chara, Fill, Kanji, Narration, Panel, TextRing } from "../koma/parts";
import { clamp01, collide, easeOut, flips, pop } from "../koma/anim";
import { getImage } from "../lib/assets";
import { beatIndexAt, beatPhase, beatsIn, snap } from "../lib/beats";
import { rand } from "../lib/random";
import { ringAngle } from "./Pre1Chorus1";

const K = CONFIG.cast;
const Q = CONFIG.cue;
const C = CONFIG.color;
const FONT = `"${CONFIG.fonts.main.family}"`;

/** Bridge：全面1コマに戻る。03（背中）。ナレーション枠のみ、文字は小さく、枠はわずかに色褪せる。出入りだけフェード */
export const Bridge: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.bridge;
  const img = getImage(K.m03);
  const line = Q.bridge.find((l) => t >= l.from && t < l.to);
  const fadeIn = interpolate(t, [s.from, s.from + 0.6], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(t, [s.to - 0.5, s.to], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const zoom = interpolate(t, [s.from, s.to], [1, 1.05]);
  return (
    <AbsoluteFill style={{ backgroundColor: C.white }}>
      <Panel poly={rect(AREA)} fill="black" borderOpacity={0.55}>
        {(w, h) => {
          const ih = h * 1.02;
          const iw = (ih * (img.width ?? 1)) / (img.height ?? 1);
          return (
            <Img
              src={img.src}
              style={{
                position: "absolute",
                left: (w - iw) / 2,
                top: (h - ih) / 2,
                width: iw,
                height: ih,
                transform: `scale(${zoom})`,
                WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
              }}
            />
          );
        }}
      </Panel>
      {line ? <Narration x={AREA.x + AREA.w - 70} y={AREA.y + 60} text={line.text} size={26} dark /> : null}
      <AbsoluteFill style={{ backgroundColor: C.white, opacity: Math.max(fadeIn, fadeOut) }} />
    </AbsoluteFill>
  );
};

/** Instrumental Break：キャラなし。空のコマ割り自体が踊る（割りの入替・回転・背景パターン切替）。最後の1コマに影が戻る */
export const Break: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.brk;
  const b = Q.brk;
  if (t >= snap(b.shadow)) {
    // 最後の1コマにキャラの影が戻る
    const box = centerBox(900, 760, W / 2, H / 2);
    const l = t - snap(b.shadow);
    return (
      <AbsoluteFill style={{ backgroundColor: C.white }}>
        <Panel poly={rect(box)} fill="halftone">
          {(w, h) => <Chara id={K.m02} w={w} h={h} crop="bust" silhouette dy={(1 - easeOut(l / 0.8)) * h * 0.6} />}
        </Panel>
      </AbsoluteFill>
    );
  }
  const bars = beatsIn(s.from, b.shadow, 4);
  const bar = Math.max(0, bars.filter((x) => t >= x).length - 1);
  const bi = beatIndexAt(t);
  const ph = beatPhase(t);
  const wob = (bi % 2 ? 1 : -1) * 5 * Math.pow(1 - ph, 2);
  const theme: Fill[] = t < b.pink ? ["halftone", "white", "black"] : t < b.black ? ["pink", "halftonePink", "white"] : ["black", "halftone", "pink"];
  const layouts = [
    () => cols([1, 1]).map(rect),
    () => rows([1, 1, 1]).map(rect),
    () => diag([[0.6, 0.4]]),
    () => irregular(5, bar + 2).map(rect),
    () => squares(2, 4).map(rect),
    () => diagRows([[0.4, 0.6]]),
    () => full().map(rect),
    () => diag([[0.3, 0.2], [0.7, 0.8]]),
    () => irregular(8, bar + 40).map(rect),
  ];
  const polys = layouts[bar % layouts.length]();
  const ang = ringAngle(t);
  return (
    <AbsoluteFill style={{ backgroundColor: C.white }}>
      {polys.map((poly, i) => {
        const fill = theme[(i + bar) % theme.length];
        const rot = (i % 2 ? wob : -wob) + (bar % 3 === 2 ? Math.sin(t * 6 + i) * 4 : 0);
        return (
          <Panel key={`${bar}-${i}`} poly={poly} fill={fill} rotate={rot}>
            {(w, h) =>
              // 背景パターンとしての回る文字（主役ではない）
              i === 0 && bar % 2 === 0 ? <TextRing w={w} h={h} angle={ang * (i % 2 ? -1 : 1)} color={fill === "black" ? "pink" : "black"} /> : null
            }
          </Panel>
        );
      })}
    </AbsoluteFill>
  );
};

const CAST_FINAL = [K.m02, K.m05, K.m07, K.base];

/** Final Chorus：割りとタイポの密度は最大。「見抜いてよ」で全部止めて、枠なし全面の04 */
export const Final: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.final;
  const f = Q.fin;
  const minuku = snap(f.minuku);
  if (t >= minuku) {
    // コマ破り3回目：枠が消えるのは全曲でここだけ
    const img = getImage(K.m04);
    const ar = (img.width ?? 1) / (img.height ?? 1);
    const iw = W;
    const ih = iw / ar;
    const face = CONFIG.faces["chara-smile-tear"].eyes;
    return (
      <AbsoluteFill style={{ backgroundColor: C.white }}>
        <Img src={img.src} style={{ position: "absolute", width: iw, height: ih, left: 0, top: H * 0.42 - face[1] * ih }} />
        <Bubble x={W * 0.86} y={H * 0.62} text={"そんな私を\n見抜いてよ！"} size={46} tail={[W * 0.66, H * 0.56]} />
      </AbsoluteFill>
    );
  }
  const ang = ringAngle(t);
  // 2拍ごとに割りを変える（密度最大）
  const cuts = beatsIn(s.from, minuku, 2);
  const k = Math.max(0, cuts.filter((x) => t >= x).length - 1);
  const shapes = [
    () => diag([[0.3, 0.18], [0.62, 0.5], [0.85, 0.75]]),
    () => irregular(7, k + 100).map(rect),
    () => diag([[0.45, 0.25]]).concat([]),
    () => irregular(8, k + 200).map(rect),
    () => diagRows([[0.35, 0.55], [0.7, 0.5]]),
  ];
  const polys = shapes[k % shapes.length]();
  const kanjiSlot = polys.length > 2 ? 1 : 0;
  // 歌詞ごとの対義語
  const battle = (w: number, h: number) => {
    if (t >= f.katta) {
      const cl = collide(t, f.katta, 0.2);
      const loseWins = t >= f.maketa; // 負けたふり：負が勝を押し返す
      return (
        <>
          <Kanji ch="勝" w={w} h={h} color="pink" outline="black" dx={-w * 0.2 - (1 - cl.p) * w * 0.3} scale={loseWins ? 0.4 : 0.8} rotate={loseWins ? -25 : 0} />
          <Kanji ch="負" w={w} h={h} color="black" dx={w * 0.2 + (1 - cl.p) * w * 0.3} scale={loseWins ? 0.95 : 0.45} />
        </>
      );
    }
    if (t >= f.ichika) {
      const cl = collide(t, f.ichika, 0.2);
      return (
        <>
          <Kanji ch="勝" w={w} h={h} color="pink" outline="black" dx={-w * 0.22 - (1 - cl.p) * w * 0.3 + cl.shake} scale={0.7} />
          <Kanji ch="負" w={w} h={h} color="black" dx={w * 0.22 + (1 - cl.p) * w * 0.3 - cl.shake} scale={0.7} />
        </>
      );
    }
    if (t >= f.hari) return <TextRing w={w} h={h} angle={ang} color="pink" r={Math.min(w, h) * 0.4} />;
    if (t >= f.naite) {
      const fl = flips(t, beatsIn(f.naite, f.hari), 0.14);
      const ch = fl.count % 2 ? "笑" : "泣";
      return <Kanji ch={ch} w={w} h={h} color={ch === "泣" ? "black" : "pink"} flipX={fl.sx} />;
    }
    const fl = flips(t, beatsIn(s.from, f.naite, 2), 0.14);
    const ch = fl.count % 2 ? "裏" : "表";
    return <Kanji ch={ch} w={w} h={h} color={ch === "表" ? "black" : "pink"} flipX={fl.sx} />;
  };
  const line =
    t >= f.maketa
      ? { text: "負けたふりして\n笑ってる", nar: false }
      : t >= f.katta
        ? { text: "勝ったつもりが\n負けていて", nar: false }
        : t >= f.ichika
          ? { text: "一か八かの\n大勝負", nar: true }
          : t >= f.hari
            ? { text: "心の針は\n止まらない", nar: true }
            : t >= f.naite
              ? { text: "泣いて　笑って\nまた転んで", nar: false }
              : t >= f.machigai
                ? { text: "間違いだらけの\n模範解答", nar: true }
                : t >= f.itoshii
                  ? { text: "ああ、\n愛おしい！", nar: false }
                  : { text: "あまのじゃく\nじゃく", nar: false };
  return (
    <AbsoluteFill style={{ backgroundColor: C.white }}>
      {polys.map((poly, i) => {
        const id = CAST_FINAL[(i + k) % CAST_FINAL.length];
        const crop = (["face", "bust", "face", "mouth", "bust"] as const)[(i + k) % 5];
        const fill: Fill = i === kanjiSlot ? (k % 2 ? "black" : "pink") : (["white", "halftone", "white", "pink", "white"] as Fill[])[(i + k) % 5];
        return (
          <Panel key={`${k}-${i}`} poly={poly} fill={fill}>
            {(w, h) => (i === kanjiSlot ? battle(w, h) : fill === "halftone" ? null : <Chara id={id} w={w} h={h} crop={crop} flip={(i + k) % 2 === 1} />)}
          </Panel>
        );
      })}
      {line.nar ? (
        <Narration x={AREA.x + AREA.w - 30} y={AREA.y + 20} text={line.text} size={44} />
      ) : (
        <Bubble x={W * 0.82} y={H * 0.7} text={line.text} size={46} spiky ura={k % 3 === 2} scale={pop(t, cuts[k] ?? s.from, 0.08)} />
      )}
    </AbsoluteFill>
  );
};

/** Outro：コマが1つずつ閉じていく。「好き、嫌い」の反転に合わせて減速。最後は09の小さな1コマに閉じ込められる */
export const Outro: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.outro;
  const o = Q.outro;
  const titleAt = s.to - o.titleSec;
  // タイトルカード（1.5秒）
  if (t >= titleAt) {
    return (
      <AbsoluteFill style={{ backgroundColor: C.white, justifyContent: "center", alignItems: "center" }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 120, letterSpacing: "0.12em", color: C.black }}>{CONFIG.title}</div>
        <div style={{ width: 200, height: 10, background: C.pink, marginTop: 30 }} />
      </AbsoluteFill>
    );
  }
  // 最後の1コマ：09 が閉じ込められる。「今の、なし。」→ 最後の和音でコマが裏返って白紙
  if (t >= o.aa) {
    const shrink = interpolate(t, [o.imano, o.chord], [1, 0.42], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const flipP = clamp01((t - o.chord) / 0.3);
    const sx = Math.max(0.02, Math.abs(Math.cos(flipP * Math.PI)));
    const blank = flipP >= 0.5;
    if (t < o.imano) {
      // ……あ。（06）
      const box = centerBox(620, 460);
      return (
        <AbsoluteFill style={{ backgroundColor: C.white }}>
          <Panel poly={rect(box)}>{(w, h) => <Chara id={K.m06} w={w} h={h} crop="face" />}</Panel>
          <Bubble x={W / 2 + 430} y={H / 2 - 120} text="……あ。" size={40} tail={[W / 2 + 260, H / 2 - 60]} />
        </AbsoluteFill>
      );
    }
    const box = centerBox(620 * shrink, 460 * shrink);
    return (
      <AbsoluteFill style={{ backgroundColor: C.white }}>
        <Panel poly={rect(box)} flipY={sx}>
          {(w, h) => (blank ? null : <Chara id={K.m09} w={w} h={h} crop="bust" />)}
        </Panel>
        {t < o.imano + 3 ? <Narration x={W / 2} y={box.y + box.h + 40} text="今の、なし。" size={34} horizontal /> : null}
        {t >= o.imanoEcho && t < o.imanoEcho + 2.4 ? <Narration x={W / 2} y={box.y + box.h + 40} text="今の、なし。" size={28} horizontal dark /> : null}
      </AbsoluteFill>
    );
  }
  // 好き、嫌い…：コマが1つずつ閉じる。反転はだんだん遅くなる
  const all = irregular(8, 77);
  const kanjiIdx = all.reduce((m, b, i) => (b.w * b.h > all[m].w * all[m].h ? i : m), 0);
  const closeOrder = all.map((_, i) => i).filter((i) => i !== kanjiIdx);
  const words = o.suki;
  const fl = flips(t, words.slice(1), interpolate(t, [s.from, o.aa], [0.12, 0.5]));
  const like = fl.count % 2 === 0;
  return (
    <AbsoluteFill style={{ backgroundColor: C.white }}>
      {all.map((b, i) => {
        const order = closeOrder.indexOf(i);
        const closeAt = order >= 0 ? words[order] : Infinity;
        const dur = interpolate(order, [0, 6], [0.12, 0.5]);
        const f = i === kanjiIdx ? 1 : 1 - clamp01((t - closeAt) / dur);
        if (f <= 0) return null;
        return (
          <Panel key={i} poly={rect(shrinkBox(b, f))} fill={i === kanjiIdx ? (like ? "pink" : "black") : i % 2 ? "halftone" : "white"}>
            {(w, h) =>
              i === kanjiIdx ? (
                <Kanji ch={like ? "好" : "嫌"} w={w} h={h} color="white" flipX={fl.sx} />
              ) : i % 2 ? null : (
                <Chara id={K.m09} w={w} h={h} crop="face" flip={i % 4 === 0} />
              )
            }
          </Panel>
        );
      })}
    </AbsoluteFill>
  );
};

void bbox;
void rand;
void beatsIn;
