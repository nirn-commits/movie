import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { CONFIG } from "../config";
import { getImage } from "../lib/assets";
import { rand, randRange } from "../lib/random";

const C = CONFIG.color;

/** 背景の単色（白・黒・ピンクのみ） */
export const Bg: React.FC<{ color: keyof typeof C }> = ({ color }) => (
  <AbsoluteFill style={{ backgroundColor: C[color] }} />
);

export type CharaProps = {
  id: string; // 素材 id（cutout 版を推奨）
  cx?: number; // 基準点を置く画面座標
  cy?: number;
  h?: number; // 絵の高さ(px)
  focus?: [number, number]; // 絵の中の基準点（比率）。寄りのときは顔や口
  flip?: boolean; // 左右反転（＝裏の私）
  rotate?: number;
  opacity?: number;
  filter?: string;
};

/** キャラ1枚。focus を (cx, cy) に合わせて置く */
export const Chara: React.FC<CharaProps> = ({
  id,
  cx = CONFIG.width / 2,
  cy = CONFIG.height / 2,
  h = 1000,
  focus = [0.5, 0.5],
  flip = false,
  rotate = 0,
  opacity = 1,
  filter,
}) => {
  const img = getImage(id);
  const w = (h * (img.width ?? 1)) / (img.height ?? 1);
  const fx = flip ? 1 - focus[0] : focus[0];
  return (
    <Img
      src={img.src}
      style={{
        position: "absolute",
        width: w,
        height: h,
        left: cx - fx * w,
        top: cy - focus[1] * h,
        transformOrigin: `${fx * 100}% ${focus[1] * 100}%`,
        transform: `${flip ? "scaleX(-1) " : ""}rotate(${rotate}deg)`,
        opacity,
        filter,
      }}
    />
  );
};

/** 顔に寄る：顔の基準点を画面中央付近に置き、高さ h で描く */
export const faceOf = (id: string, part: "eyes" | "mouth" = "eyes") => {
  const key = id.replace(/-cutout$/, "");
  return CONFIG.faces[key]?.[part] ?? [0.5, 0.3];
};

export type TypoProps = {
  text: string;
  x?: number;
  y?: number;
  size?: number;
  color?: keyof typeof C;
  font?: keyof typeof CONFIG.fonts;
  align?: "left" | "center" | "right";
  rotate?: number;
  tracking?: number; // em
  vertical?: boolean;
  opacity?: number;
  flip?: boolean;
  scale?: number;
  outline?: keyof typeof C;
};

/** タイポ。x, y は文字の基準点（align に応じて左端・中央・右端） */
export const Typo: React.FC<TypoProps> = ({
  text,
  x = CONFIG.width / 2,
  y = CONFIG.height / 2,
  size = 120,
  color = "black",
  font = "display",
  align = "center",
  rotate = 0,
  tracking = 0.02,
  vertical = false,
  opacity = 1,
  flip = false,
  scale = 1,
  outline,
}) => {
  const shift = align === "center" ? "-50%" : align === "right" ? "-100%" : "0%";
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `translate(${shift}, -50%) rotate(${rotate}deg) scale(${flip ? -scale : scale}, ${scale})`,
        fontFamily: `"${CONFIG.fonts[font].family}"`,
        fontWeight: CONFIG.fonts[font].weight as React.CSSProperties["fontWeight"],
        fontSize: size,
        letterSpacing: `${tracking}em`,
        lineHeight: 1.1,
        color: C[color],
        whiteSpace: "pre",
        writingMode: vertical ? "vertical-rl" : undefined,
        opacity,
        WebkitTextStroke: outline ? `${Math.max(2, size / 28)}px ${C[outline]}` : undefined,
        paintOrder: "stroke fill",
      }}
    >
      {text}
    </div>
  );
};

/** トランプ1枚（コードで描く。白地にピンクの縁、スートはピンクか黒） */
export const Card: React.FC<{ suit: number; rank: string; w?: number; back?: boolean }> = ({
  suit,
  rank,
  w = 160,
  back = false,
}) => {
  const h = w * 1.4;
  const suits = ["♠", "♥", "♣", "♦"];
  const red = suit % 2 === 1;
  const ink = red ? C.pink : C.black;
  if (back) {
    return (
      <svg width={w} height={h} viewBox="0 0 100 140">
        <rect x="2" y="2" width="96" height="136" rx="8" fill={C.black} stroke={C.pink} strokeWidth="3" />
        <rect x="10" y="10" width="80" height="120" rx="4" fill="none" stroke={C.pink} strokeWidth="2" />
        <text x="50" y="82" textAnchor="middle" fontSize="40" fill={C.pink}>
          ♦
        </text>
      </svg>
    );
  }
  return (
    <svg width={w} height={h} viewBox="0 0 100 140">
      <rect x="2" y="2" width="96" height="136" rx="8" fill={C.white} stroke={C.black} strokeWidth="3" />
      <rect x="8" y="8" width="84" height="124" rx="5" fill="none" stroke={C.pink} strokeWidth="1.5" />
      <text x="14" y="30" fontSize="20" fontFamily="serif" fontWeight="bold" fill={ink}>
        {rank}
      </text>
      <text x="50" y="92" textAnchor="middle" fontSize="54" fill={ink}>
        {suits[suit]}
      </text>
    </svg>
  );
};

/** トランプを降らせる。t は開始からの経過秒。シードで配置が決まる */
export const CardRain: React.FC<{ t: number; count?: number; seed?: number; speed?: number; size?: number }> = ({
  t,
  count = 28,
  seed = 1,
  speed = 700,
  size = 150,
}) => {
  const ranks = ["A", "K", "Q", "J", "7", "3", "2"];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {Array.from({ length: count }, (_, i) => {
        const s = seed * 1000 + i * 7;
        const delay = randRange(s, 0, 1.2);
        const lt = t - delay;
        if (lt < 0) return null;
        const x = randRange(s + 1, -100, CONFIG.width + 100);
        const v = speed * randRange(s + 2, 0.7, 1.3);
        const y = -260 + lt * v;
        const rot = randRange(s + 3, -40, 40) + lt * randRange(s + 4, -200, 200);
        const flipY = Math.cos(lt * randRange(s + 5, 3, 8));
        const back = flipY < 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.sin(lt * 2 + i) * 40,
              top: y,
              transform: `rotate(${rot}deg) scaleY(${Math.max(0.08, Math.abs(flipY))})`,
            }}
          >
            <Card suit={i % 4} rank={ranks[i % ranks.length]} w={size * randRange(s + 6, 0.8, 1.2)} back={back} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** 好き／嫌いの札。flips の各時刻でパタパタ反転する（4フレームで裏返る） */
export const Sign: React.FC<{
  t: number;
  flips: number[]; // 反転する時刻（秒）
  startLike?: boolean;
  x: number;
  y: number;
  h?: number;
  flipSec?: number;
  rotate?: number;
  cracked?: number; // ヒビの進み具合 0〜1
}> = ({ t, flips, startLike = true, x, y, h = 520, flipSec = 0.13, rotate = 0, cracked = 0 }) => {
  let n = 0;
  let last = -Infinity;
  for (const f of flips) {
    if (t >= f) {
      n++;
      last = f;
    }
  }
  const like = startLike ? n % 2 === 0 : n % 2 === 1;
  const p = Math.min(1, (t - last) / flipSec); // 0→1
  // 反転中：前半は旧面が縮み、後半は新面が開く
  const showing = p < 0.5 ? !like : like;
  const sx = p < 1 ? Math.abs(Math.cos(p * Math.PI)) : 1;
  const img = getImage(showing ? "prop-sign-like" : "prop-sign-dislike");
  const w = (h * (img.width ?? 1)) / (img.height ?? 1);
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        transform: `rotate(${rotate}deg) scaleX(${Math.max(0.04, sx)})`,
      }}
    >
      <Img src={img.src} style={{ width: w, height: h }} />
      {cracked > 0 ? <Crack w={w} h={h} progress={cracked} /> : null}
    </div>
  );
};

/** 札の円盤に入るヒビ（progress 0〜1 で伸びる） */
export const Crack: React.FC<{ w: number; h: number; progress: number }> = ({ w, h, progress }) => {
  // 円盤の中心は札の上から約 37%
  const cx = w / 2;
  const cy = h * 0.37;
  const r = w * 0.42;
  const branches = [
    [0, 0, -0.2, -0.35, -0.05, -0.6, -0.25, -0.95],
    [0, 0, 0.3, -0.1, 0.45, -0.4, 0.9, -0.45],
    [0, 0, 0.15, 0.3, 0.05, 0.6, 0.35, 0.9],
    [0, 0, -0.35, 0.15, -0.6, 0.05, -0.95, 0.3],
  ];
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
      {branches.map((b, i) => {
        const pts: string[] = [];
        const segs = b.length / 2;
        const upto = progress * (segs - 1);
        for (let k = 0; k < segs; k++) {
          if (k > upto + 1) break;
          let px = b[k * 2];
          let py = b[k * 2 + 1];
          if (k > upto) {
            const f = upto - (k - 1);
            px = b[(k - 1) * 2] + (px - b[(k - 1) * 2]) * f;
            py = b[(k - 1) * 2 + 1] + (py - b[(k - 1) * 2 + 1]) * f;
          }
          pts.push(`${cx + px * r},${cy + py * r}`);
        }
        return (
          <g key={i}>
            <polyline points={pts.join(" ")} fill="none" stroke={C.black} strokeWidth={9} strokeLinejoin="miter" />
            <polyline points={pts.join(" ")} fill="none" stroke={C.white} strokeWidth={3} strokeLinejoin="miter" />
          </g>
        );
      })}
    </svg>
  );
};

/** ステージのカーテン（左右）。swing は -1〜1 の揺れ */
export const Curtains: React.FC<{ swingL: number; swingR: number; open?: number }> = ({ swingL, swingR, open = 0 }) => {
  const img = getImage("bg-stage-curtain");
  const W = CONFIG.width;
  const H = CONFIG.height;
  const iw = W;
  const ih = (W * (img.height ?? 1)) / (img.width ?? 1);
  const half = W * 0.24;
  const panel = (side: "L" | "R", swing: number) => (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: side === "L" ? -open * half : W - half + open * half,
        width: half,
        height: H,
        overflow: "hidden",
        transformOrigin: side === "L" ? "0% 0%" : "100% 0%",
        transform: `skewX(${swing * 9}deg) scaleX(${1 + Math.abs(swing) * 0.12})`,
      }}
    >
      <Img
        src={img.src}
        style={{
          position: "absolute",
          width: iw,
          height: ih,
          top: (H - ih) / 2,
          left: side === "L" ? 0 : -(W - half),
        }}
      />
    </div>
  );
  return (
    <AbsoluteFill>
      {panel("L", swingL)}
      {panel("R", swingR)}
    </AbsoluteFill>
  );
};

/** 擬似乱数を直接使いたい場面用の再輸出 */
export { rand, randRange };
