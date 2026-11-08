/**
 * コマ割りの幾何。ページ（1920×1080）をマンガの1ページとして割る。
 * 基本形は5種：全面1コマ／左右2分割／横3段／斜め割り／不規則な多分割（＋正方形等分・縦割りは派生）
 */
import { CONFIG } from "../config";
import { rand } from "../lib/random";

export type Pt = [number, number];
export type Poly = Pt[];
export type Box = { x: number; y: number; w: number; h: number };

const { margin: M, gutter: G } = CONFIG.page;
export const W = CONFIG.width;
export const H = CONFIG.height;
export const AREA: Box = { x: M, y: M, w: W - 2 * M, h: H - 2 * M };

export const rect = (b: Box): Poly => [
  [b.x, b.y],
  [b.x + b.w, b.y],
  [b.x + b.w, b.y + b.h],
  [b.x, b.y + b.h],
];

export const bbox = (p: Poly): Box => {
  const xs = p.map((q) => q[0]);
  const ys = p.map((q) => q[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
};

/** 全面1コマ */
export const full = (a: Box = AREA): Box[] => [a];

/** 左右に分割（ratios の比で横に並べる） */
export const cols = (ratios: number[], a: Box = AREA): Box[] => {
  const total = ratios.reduce((s, r) => s + r, 0);
  const free = a.w - G * (ratios.length - 1);
  let x = a.x;
  return ratios.map((r) => {
    const w = (free * r) / total;
    const b = { x, y: a.y, w, h: a.h };
    x += w + G;
    return b;
  });
};

/** 上下に分割（横3段など） */
export const rows = (ratios: number[], a: Box = AREA): Box[] => {
  const total = ratios.reduce((s, r) => s + r, 0);
  const free = a.h - G * (ratios.length - 1);
  let y = a.y;
  return ratios.map((r) => {
    const h = (free * r) / total;
    const b = { x: a.x, y, w: a.w, h };
    y += h + G;
    return b;
  });
};

/**
 * 斜め割り（サビ用）。cuts は各切れ目の上端と下端の x（比率 0〜1）
 * 例：[[0.55, 0.35]] で右上がりの2分割
 */
export const diag = (cuts: [number, number][], a: Box = AREA): Poly[] => {
  const xs = (f: number) => a.x + a.w * f;
  const edges: [number, number][] = [[a.x, a.x], ...cuts.map(([t, b]) => [xs(t), xs(b)] as [number, number]), [a.x + a.w, a.x + a.w]];
  const polys: Poly[] = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const [lt, lb] = edges[i];
    const [rt, rb] = edges[i + 1];
    const gl = i === 0 ? 0 : G / 2;
    const gr = i === edges.length - 2 ? 0 : G / 2;
    polys.push([
      [lt + gl, a.y],
      [rt - gr, a.y],
      [rb - gr, a.y + a.h],
      [lb + gl, a.y + a.h],
    ]);
  }
  return polys;
};

/** 斜めの横割り（上下に斜めの切れ目）。cuts は各切れ目の左端と右端の y（比率） */
export const diagRows = (cuts: [number, number][], a: Box = AREA): Poly[] => {
  const ys = (f: number) => a.y + a.h * f;
  const edges: [number, number][] = [[a.y, a.y], ...cuts.map(([l, r]) => [ys(l), ys(r)] as [number, number]), [a.y + a.h, a.y + a.h]];
  const polys: Poly[] = [];
  for (let i = 0; i < edges.length - 1; i++) {
    const [tl, tr] = edges[i];
    const [bl, br] = edges[i + 1];
    const gt = i === 0 ? 0 : G / 2;
    const gb = i === edges.length - 2 ? 0 : G / 2;
    polys.push([
      [a.x, tl + gt],
      [a.x + a.w, tr + gt],
      [a.x + a.w, br - gb],
      [a.x, bl - gb],
    ]);
  }
  return polys;
};

/** 正方形の等分コマ（rows×cols、ページ中央に寄せる） */
export const squares = (r: number, c: number, a: Box = AREA): Box[] => {
  const s = Math.min((a.w - G * (c - 1)) / c, (a.h - G * (r - 1)) / r);
  const tw = s * c + G * (c - 1);
  const th = s * r + G * (r - 1);
  const x0 = a.x + (a.w - tw) / 2;
  const y0 = a.y + (a.h - th) / 2;
  const out: Box[] = [];
  for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) out.push({ x: x0 + j * (s + G), y: y0 + i * (s + G), w: s, h: s });
  return out;
};

/** 不規則な多分割（掛け合い用）。シードで決まるギロチン分割 */
export const irregular = (n: number, seed: number, a: Box = AREA): Box[] => {
  let boxes: Box[] = [a];
  let k = 0;
  while (boxes.length < n) {
    // いちばん大きい箱を割る
    boxes.sort((p, q) => q.w * q.h - p.w * p.h);
    const b = boxes.shift() as Box;
    const r = 0.36 + rand(seed * 31 + k) * 0.28;
    const vertical = b.w / b.h > 1.15 ? true : b.h / b.w > 1.15 ? false : rand(seed * 17 + k) > 0.5;
    if (vertical) {
      const w1 = (b.w - G) * r;
      boxes.push({ x: b.x, y: b.y, w: w1, h: b.h }, { x: b.x + w1 + G, y: b.y, w: b.w - w1 - G, h: b.h });
    } else {
      const h1 = (b.h - G) * r;
      boxes.push({ x: b.x, y: b.y, w: b.w, h: h1 }, { x: b.x, y: b.y + h1 + G, w: b.w, h: b.h - h1 - G });
    }
    k++;
  }
  return boxes.sort((p, q) => p.y - q.y || p.x - q.x);
};

/** 箱を中心に向かって縮める（f=1 で元のまま、0 で点） */
export const shrinkBox = (b: Box, f: number): Box => ({
  x: b.x + (b.w * (1 - f)) / 2,
  y: b.y + (b.h * (1 - f)) / 2,
  w: b.w * f,
  h: b.h * f,
});

/** 2つの箱の補間（割りの変化をつなぐ） */
export const lerpBox = (a: Box, b: Box, f: number): Box => ({
  x: a.x + (b.x - a.x) * f,
  y: a.y + (b.y - a.y) * f,
  w: a.w + (b.w - a.w) * f,
  h: a.h + (b.h - a.h) * f,
});

/** 中央に置く箱 */
export const centerBox = (w: number, h: number, cx = W / 2, cy = H / 2): Box => ({ x: cx - w / 2, y: cy - h / 2, w, h });
