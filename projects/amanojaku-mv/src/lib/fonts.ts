/**
 * assets/fonts のフォントを id 経由で読み込む。読み込み完了までレンダリングを待たせる。
 */
import { continueRender, delayRender } from "remotion";
import { CONFIG } from "../config";
import { getAsset } from "./assets";

let started = false;

export const loadFonts = () => {
  if (started || typeof document === "undefined") return;
  started = true;
  const handle = delayRender("フォント読み込み");
  Promise.all(
    Object.values(CONFIG.fonts).map((f) =>
      new FontFace(f.family, `url(${getAsset(f.id).src})`, { weight: f.weight })
        .load()
        .then((face) => document.fonts.add(face)),
    ),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
};
