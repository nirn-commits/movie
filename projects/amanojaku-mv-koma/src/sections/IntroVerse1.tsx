import React from "react";
import { AbsoluteFill } from "remotion";
import { CONFIG } from "../config";
import { AREA, H, W, cols, diag, rect, rows } from "../koma/geom";
import { Bubble, Chara, Kanji, Narration, PageBg, Panel } from "../koma/parts";
import { clamp01, easeOut, flips, page, pageAt, pop, slowZoom } from "../koma/anim";
import { beatsIn } from "../lib/beats";
import { lerpBox } from "../koma/geom";

const K = CONFIG.cast;
const Q = CONFIG.cue;
const C = CONFIG.color;

/** Intro：全面1コマ（黒）。枠線が描かれてコマが完成 → 中に「しーっ」。「じゃ、もう一回！」でコマが割れる */
export const Intro: React.FC<{ t: number }> = ({ t }) => {
  const split = Q.introSplit; // 拍の表は 16.09s からなので、ここは歌の位置そのまま
  if (t < split) {
    const draw = clamp01(t / 2.6); // 枠を1本ずつ描く（周を順にたどる）
    const done = draw >= 1;
    let line = "";
    for (const l of Q.intro) if (t >= l.at) line = l.text;
    return (
      <AbsoluteFill>
        <PageBg />
        <Panel poly={rect(AREA)} fill="black" borderDraw={draw}>
          {(w, h) =>
            done ? (
              <>
                {/* ピンスポットの当たり */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: `radial-gradient(circle at 50% 46%, rgba(255,255,255,0.15) 0px, rgba(255,255,255,0) 520px)`,
                  }}
                />
                <Chara id={K.m10} w={w} h={h} crop="bust" zoom={slowZoom(t - 2.6, 0.008, 1.08)} />
              </>
            ) : null
          }
        </Panel>
        {line ? <Narration x={AREA.x + AREA.w - 60} y={AREA.y + 50} text={line} size={44} /> : null}
      </AbsoluteFill>
    );
  }
  // コマが割れて、表｜裏の斜め2コマへ。小節ごとに表と裏が入れ替わる
  const polys = diag([[0.56, 0.44]]);
  const jolt = 1 - easeOut((t - split) / 0.3);
  const swaps = beatsIn(split + 0.5, CONFIG.sections.intro.to, 4);
  const f = flips(t, swaps, 0.2);
  const swapped = f.count % 2 === 1;
  return (
    <AbsoluteFill>
      <PageBg />
      <Panel poly={polys[0]} fill={swapped ? "black" : "white"} rotate={-3 * jolt}>
        {(w, h) => <Kanji ch={swapped ? "裏" : "表"} w={w} h={h} color={swapped ? "white" : "black"} flipX={f.sx} />}
      </Panel>
      <Panel poly={polys[1]} fill={swapped ? "white" : "black"} rotate={3 * jolt}>
        {(w, h) => <Kanji ch={swapped ? "表" : "裏"} w={w} h={h} color={swapped ? "black" : "white"} flipX={f.sx} />}
      </Panel>
    </AbsoluteFill>
  );
};

/** 横3段（＋段内を左右に割る）のページ */
type Cell = { fill?: "white" | "black" | "pink" | "halftone" | "halftonePink"; node?: (w: number, h: number) => React.ReactNode };

const Rows: React.FC<{ ratios: number[]; cells: Cell[][]; splits?: number[][] }> = ({ ratios, cells, splits }) => {
  const rs = rows(ratios);
  return (
    <>
      {rs.map((r, i) => {
        const cs = cols(splits?.[i] ?? cells[i].map(() => 1), r);
        return cs.map((b, j) => {
          const cell = cells[i][j] ?? {};
          return (
            <Panel key={`${i}-${j}`} poly={rect(b)} fill={cell.fill ?? "white"}>
              {cell.node}
            </Panel>
          );
        });
      })}
    </>
  );
};

/** Verse 1：横3段コマ。各行で段の比率が変わる */
export const Verse1: React.FC<{ t: number }> = ({ t }) => {
  const s = CONFIG.sections.verse1;
  const v = Q.v1;
  const base = K.base;
  const pages = [
    page(s.from, (l) => (
      <Rows
        ratios={[1.4, 1, 0.8]}
        cells={[
          [{ node: (w, h) => <Chara id={base} w={w} h={h} crop="bust" zoom={slowZoom(l)} /> }],
          [{ node: (w, h) => <Chara id={base} w={w} h={h} crop="face" align={0.4} /> }, { fill: "halftone" }],
          [{ fill: "black", node: (w, h) => <Kanji ch="表" w={w} h={h} color="white" /> }, { node: (w, h) => <Kanji ch="裏" w={w} h={h} color="pink" /> }],
        ]}
      />
    )),
    page(17.8, (l) => (
      <Rows
        ratios={[0.8, 1.5, 0.9]}
        splits={[[2, 1], [1], [1, 2]]}
        cells={[
          [{ node: (w, h) => <Chara id={base} w={w} h={h} crop="face" align={0.3} /> }, { fill: "halftonePink" }],
          [{ node: (w, h) => <Chara id={base} w={w} h={h} crop="bust" align={0.62} zoom={slowZoom(l)} /> }],
          [{ fill: "pink" }, { node: (w, h) => <Chara id={base} w={w} h={h} crop="mouth" /> }],
        ]}
      />
    )),
    page(19.5, (l) => (
      <Rows
        ratios={[1, 0.7, 1.5]}
        splits={[[1, 1, 1], [1], [1, 2]]}
        cells={[
          [
            { node: (w, h) => <Chara id={base} w={w} h={h} crop="face" /> },
            { fill: "halftone" },
            { node: (w, h) => <Chara id={base} w={w} h={h} crop="face" flip /> },
          ],
          [{ fill: "black", node: (w, h) => <Kanji ch="裏" w={w} h={h} color="pink" /> }],
          [{ node: (w, h) => <Chara id={base} w={w} h={h} crop="full" /> }, { node: (w, h) => <Chara id={base} w={w} h={h} crop="bust" zoom={slowZoom(l)} /> }],
        ]}
      />
    )),
    page(21.2, () => (
      <Rows
        ratios={[1, 1, 1]}
        cells={[
          [{ node: (w, h) => <Chara id={base} w={w} h={h} crop="bust" align={0.7} /> }],
          [{ node: (w, h) => <Chara id={base} w={w} h={h} crop="bust" align={0.5} /> }],
          [{ node: (w, h) => <Chara id={base} w={w} h={h} crop="bust" align={0.3} /> }],
        ]}
      />
    )),
    // 「右向け右なら左向き」：中段の左右のコマの位置そのものが入れ替わる
    page(v.migi, () => {
      const rs = rows([0.8, 1.6, 0.8]);
      const [a, b] = cols([1, 1], rs[1]);
      const p = easeOut((t - v.hidari) / 0.2);
      const left = t >= v.hidari;
      const charBox = lerpBox(a, b, left ? p : 0);
      const kanjiBox = lerpBox(b, a, left ? p : 0);
      const f = flips(t, [v.hidari], 0.2);
      return (
        <>
          <Panel poly={rect(rs[0])} fill="halftone" />
          <Panel poly={rect(charBox)}>{(w, h) => <Chara id={base} w={w} h={h} crop="bust" flip={f.count > 0} />}</Panel>
          <Panel poly={rect(kanjiBox)} fill={left ? "pink" : "white"}>
            {(w, h) => <Kanji ch={f.count > 0 ? "左" : "右"} w={w} h={h} color={left ? "white" : "black"} flipX={f.sx} scale={pop(t, v.hidari, 0.15)} />}
          </Panel>
          <Panel poly={rect(rs[2])} fill="black" />
          <Bubble x={W * 0.62} y={H * 0.17} text={left ? "左向き" : "右向け右なら"} size={46} tail={[W * 0.4, H * 0.32]} />
        </>
      );
    }),
    // 「ご機嫌いかがと裏返し」：表の字が裏に反転
    page(v.gokigen, (l) => {
      const f = flips(t, [v.uragaeshi], 0.22);
      return (
        <>
          <Rows
            ratios={[1, 1, 1]}
            splits={[[2, 1], [1], [1, 2]]}
            cells={[
              [{ node: (w, h) => <Chara id={base} w={w} h={h} crop="bust" align={0.35} zoom={slowZoom(l)} /> }, { fill: "halftonePink" }],
              [{ fill: f.count ? "black" : "white", node: (w, h) => <Kanji ch={f.count ? "裏" : "表"} w={w} h={h} color={f.count ? "white" : "black"} flipX={f.sx} /> }],
              [{ fill: "halftone" }, { node: (w, h) => <Chara id={base} w={w} h={h} crop="bust" flip align={0.6} /> }],
            ]}
          />
          <Bubble x={W * 0.86} y={H * 0.2} text={"ご機嫌\nいかが？"} size={42} tail={[W * 0.62, H * 0.22]} />
        </>
      );
    }),
    page(v.aisou, (l) => (
      <>
        <Rows
          ratios={[1.5, 0.8, 1]}
          splits={[[1], [1, 1, 1], [3, 1]]}
          cells={[
            [{ node: (w, h) => <Chara id={base} w={w} h={h} crop="face" align={0.4} zoom={slowZoom(l)} /> }],
            [{ fill: "halftone" }, { node: (w, h) => <Chara id={base} w={w} h={h} crop="mouth" /> }, { fill: "halftone" }],
            [{ node: (w, h) => <Chara id={base} w={w} h={h} crop="bust" align={0.3} /> }, { fill: "pink" }],
          ]}
        />
        <Narration x={AREA.x + AREA.w - 40} y={AREA.y + 30} text={"愛想笑いは\nお手のもの"} size={40} />
      </>
    )),
    // 「でも本音は企業秘密」：09（しーっ寄り）だけのコマが1つ混ざる
    page(v.honne, () => (
      <>
        <Rows
          ratios={[1, 1, 1]}
          splits={[[1], [1, 1, 1], [1]]}
          cells={[
            [{ node: (w, h) => <Chara id={base} w={w} h={h} crop="bust" align={0.25} /> }],
            [
              { node: (w, h) => <Chara id={base} w={w} h={h} crop="face" /> },
              { fill: "pink", node: (w, h) => <Chara id={K.m09} w={w} h={h} crop="face" /> },
              { node: (w, h) => <Chara id={base} w={w} h={h} crop="face" flip /> },
            ],
            [{ node: (w, h) => <Chara id={base} w={w} h={h} crop="bust" align={0.75} flip /> }],
          ]}
        />
        <Narration x={W * 0.62} y={AREA.y + 30} text="でも本音は" size={40} />
        <Bubble x={W * 0.5} y={H * 0.82} text={"企業\n秘密"} size={50} tail={[W * 0.5, H * 0.58]} />
      </>
    )),
    page(v.aremo, () => (
      <>
        <Rows
          ratios={[1, 1, 1]}
          splits={[[1, 1, 1, 1], [1, 1], [1, 1, 1, 1]]}
          cells={[
            [0, 1, 2, 3].map((i) => ({ node: (w: number, h: number) => <Chara id={base} w={w} h={h} crop={i % 2 ? "face" : "bust"} flip={i % 2 === 1} /> })),
            [{ fill: "halftonePink" }, { node: (w, h) => <Chara id={base} w={w} h={h} crop="bust" /> }],
            [0, 1, 2, 3].map((i) => ({ fill: i === 2 ? ("pink" as const) : ("white" as const), node: i === 2 ? undefined : (w: number, h: number) => <Chara id={base} w={w} h={h} crop="mouth" flip={i % 2 === 0} /> })),
          ]}
        />
        <Bubble x={W * 0.27} y={H * 0.5} text={"あれもこれも\n欲張って"} size={42} tail={[W * 0.6, H * 0.5]} />
      </>
    )),
    page(v.doremo, (l) => (
      <>
        <Rows
          ratios={[1, 1, 1]}
          cells={[
            [{ node: (w, h) => <Chara id={base} w={w} h={h} crop="face" align={0.7} zoom={slowZoom(l, 0.01)} /> }],
            [{ fill: "halftone" }],
            [{ node: (w, h) => <Chara id={base} w={w} h={h} crop="face" align={0.3} flip zoom={slowZoom(l, 0.01)} /> }],
          ]}
        />
        <Narration x={W * 0.5} y={H * 0.36} text="どれもそれも退屈で" size={38} horizontal />
      </>
    )),
    // 「予定調和の三拍子」：3段が拍ごとに1つずつ光る
    page(v.yotei, () => {
      const bs = beatsIn(v.yotei, v.ippaku);
      const k = Math.max(0, bs.filter((b) => t >= b).length - 1) % 3;
      return (
        <>
          <Rows
            ratios={[1, 1, 1]}
            cells={[0, 1, 2].map((i) => [
              {
                fill: k === i ? ("pink" as const) : ("white" as const),
                node: (w: number, h: number) => <Chara id={base} w={w} h={h} crop="bust" align={0.2 + i * 0.3} />,
              },
            ])}
          />
          <Narration x={AREA.x + AREA.w - 40} y={AREA.y + 30} text={"予定調和の\n三拍子"} size={40} />
        </>
      );
    }),
    // 「一拍余計に踊りましょ」：段が1つ増える
    page(v.ippaku, (l) => (
      <>
        <Rows
          ratios={[1, 1, 1, 1]}
          splits={[[1], [1, 1], [1], [1, 1, 1]]}
          cells={[
            [{ node: (w, h) => <Chara id={base} w={w} h={h} crop="bust" align={0.3} zoom={slowZoom(l)} /> }],
            [{ fill: "pink" }, { node: (w, h) => <Chara id={base} w={w} h={h} crop="face" /> }],
            [{ fill: "black" }],
            [{ node: (w, h) => <Chara id={base} w={w} h={h} crop="face" flip /> }, { fill: "halftone" }, { node: (w, h) => <Chara id={base} w={w} h={h} crop="face" /> }],
          ]}
        />
        <Bubble x={W * 0.84} y={H * 0.28} text={"一拍余計に\n踊りましょ"} size={40} tail={[W * 0.6, H * 0.2]} />
      </>
    )),
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: C.white }}>
      {pageAt(t, pages)}
    </AbsoluteFill>
  );
};
