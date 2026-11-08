import React from "react";
import { CONFIG } from "../config";
import { snap } from "./beats";

type ColorKey = keyof typeof CONFIG.color;

/** ショット：at 秒から次のショットまで表示する。切り替えはすべてハードカット */
export type Shot = { at: number; bg?: ColorKey; render: (local: number) => React.ReactNode };

/** at を拍に吸着させたショット */
export const onBeat = (at: number, render: Shot["render"], bg?: ColorKey): Shot => ({ at: snap(at), render, bg });

/** t における現在のショット */
export const currentShot = (t: number, shots: Shot[]) => {
  const sorted = [...shots].sort((a, b) => a.at - b.at);
  let cur = sorted[0];
  for (const s of sorted) if (t >= s.at) cur = s;
  return { shot: cur, local: t - cur.at };
};

/** 時刻 at 以降なら表示（歌詞の出現など） */
export const after = (t: number, at: number, node: React.ReactNode) => (t >= at ? node : null);

/** 区間 [a, b) の間だけ表示 */
export const between = (t: number, a: number, b: number, node: React.ReactNode) =>
  t >= a && t < b ? node : null;
