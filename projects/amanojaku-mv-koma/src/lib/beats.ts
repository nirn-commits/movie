/**
 * 拍の表（analysis/beats.py が生成した src/data/beats.json）を引くヘルパー。
 * カットはすべてここから取った拍の時刻に置く。
 */
import data from "../data/beats.json";

export type Beat = { t: number; strength: number; hat: number; brass: number };
export const BEATS: Beat[] = (data as { beats: Beat[] }).beats;

/** t 秒以前で最後の拍の番号（拍より前なら -1） */
export const beatIndexAt = (t: number) => {
  let lo = 0;
  let hi = BEATS.length - 1;
  if (t < BEATS[0].t) return -1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (BEATS[mid].t <= t) lo = mid;
    else hi = mid - 1;
  }
  return lo;
};

/** t 秒に最も近い拍の時刻 */
export const snap = (t: number) => {
  const i = Math.max(0, beatIndexAt(t));
  const a = BEATS[i];
  const b = BEATS[Math.min(i + 1, BEATS.length - 1)];
  return Math.abs(a.t - t) <= Math.abs(b.t - t) ? a.t : b.t;
};

/** 区間 [from, to) に入る拍の時刻一覧（every 拍ごと） */
export const beatsIn = (from: number, to: number, every = 1) =>
  BEATS.filter((b) => b.t >= from - 1e-3 && b.t < to - 1e-3)
    .filter((_, i) => i % every === 0)
    .map((b) => b.t);

/** 区間内のカット点一覧から、t が何番目のショットかを返す */
export const shotIndex = (t: number, cuts: number[]) => {
  let k = 0;
  for (let i = 0; i < cuts.length; i++) if (t >= cuts[i]) k = i;
  return k;
};

/** 直前の拍からの経過（0〜1）。拍ごとのバウンスに使う */
export const beatPhase = (t: number) => {
  const i = beatIndexAt(t);
  if (i < 0 || i + 1 >= BEATS.length) return 0;
  return (t - BEATS[i].t) / (BEATS[i + 1].t - BEATS[i].t);
};
