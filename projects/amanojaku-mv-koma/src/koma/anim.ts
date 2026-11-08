/**
 * 時刻だけで決まる動きの関数群（Date.now / Math.random は使わない）
 */
import { snap } from "../lib/beats";

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

/** ページ：at 秒から次のページまで。切り替えはハードカット（＝割りの変化） */
export type Page = { at: number; render: (local: number) => React.ReactNode };
export const page = (at: number, render: Page["render"], onBeat = true): Page => ({ at: onBeat ? snap(at) : at, render });
export const pageAt = (t: number, pages: Page[]) => {
  const sorted = [...pages].sort((a, b) => a.at - b.at);
  let cur = sorted[0];
  for (const p of sorted) if (t >= p.at) cur = p;
  return cur.render(t - cur.at);
};

/** 区間ごとの一定角速度を積分した角度 */
export const integrate = (t: number, speeds: { from: number; v: number }[]) => {
  let a = 0;
  for (let i = 0; i < speeds.length; i++) {
    const s = speeds[i].from;
    const e = i + 1 < speeds.length ? speeds[i + 1].from : Infinity;
    if (t <= s) break;
    a += (Math.min(t, e) - s) * speeds[i].v;
  }
  return a;
};

/**
 * 反転：times の各時刻でパタッと裏返る。
 * count は裏返った回数（反転の中間点で切り替わる）、sx は横幅（1→0→1）
 */
export const flips = (t: number, times: number[], dur = 0.16) => {
  let count = 0;
  let sx = 1;
  for (const f of times) {
    if (t >= f + dur / 2) count++;
    if (t >= f && t < f + dur) sx = Math.abs(Math.cos(((t - f) / dur) * Math.PI));
  }
  return { count, sx: Math.max(0.03, sx) };
};

/** 衝突：t0 から dur 秒で両側から中央へ。impact 後は少し揺れる */
export const collide = (t: number, t0: number, dur = 0.18) => {
  const p = clamp01((t - t0) / dur);
  const after = t - t0 - dur;
  const shake = after > 0 && after < 0.25 ? Math.sin(after * 90) * 14 * (1 - after / 0.25) : 0;
  return { p: easeOut(p), shake, hit: after >= 0 };
};

/** 拍で跳ねる：t0 で最大、decay 秒で戻る */
export const pop = (t: number, t0: number, amount = 0.12, decay = 0.3) => {
  const d = t - t0;
  if (d < 0 || d > decay) return 1;
  return 1 + amount * Math.pow(1 - d / decay, 3);
};

/** コマ内の低速ズーム（1 → max、ゆっくり） */
export const slowZoom = (local: number, perSec = 0.02, max = 1.08) => Math.min(max, 1 + local * perSec);
