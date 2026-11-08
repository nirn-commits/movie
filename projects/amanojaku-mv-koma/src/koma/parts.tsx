import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { CONFIG, ColorKey } from "../config";
import { getImage } from "../lib/assets";
import { Box, Poly, bbox } from "./geom";

const C = CONFIG.color;
const FONT = `"${CONFIG.fonts.main.family}"`;
const B = CONFIG.page.border;

export type Fill = ColorKey | "halftone" | "halftonePink" | "none";

const fillStyle = (f: Fill): React.CSSProperties => {
  if (f === "none") return {};
  if (f === "halftone")
    return { backgroundColor: C.white, backgroundImage: `radial-gradient(${C.black} 28%, transparent 30%)`, backgroundSize: "22px 22px" };
  if (f === "halftonePink")
    return { backgroundColor: C.white, backgroundImage: `radial-gradient(${C.pink} 30%, transparent 32%)`, backgroundSize: "26px 26px" };
  return { backgroundColor: C[f] };
};

/**
 * コマ1つ。poly（ページ座標）で切り抜き、黒の太枠を描く。
 * children は (w, h) を受け取り、コマの外接矩形内に中身を描く。
 */
export const Panel: React.FC<{
  poly: Poly;
  fill?: Fill;
  rotate?: number; // コマごと傾ける（度）
  borderDraw?: number; // 枠の描かれ具合 0〜1（Intro）
  borderOpacity?: number; // 枠の色あせ（Bridge）
  borderColor?: ColorKey;
  crack?: number; // 枠のヒビ 0〜1
  flipY?: number; // 裏返し 1→-1（scaleX）
  children?: (w: number, h: number) => React.ReactNode;
}> = ({ poly, fill = "white", rotate = 0, borderDraw = 1, borderOpacity = 1, borderColor = "black", crack = 0, flipY = 1, children }) => {
  const b = bbox(poly);
  const local = poly.map(([x, y]) => [x - b.x, y - b.y]);
  const clip = `polygon(${local.map(([x, y]) => `${x}px ${y}px`).join(",")})`;
  const pts = local.map(([x, y]) => `${x},${y}`).join(" ");
  const pad = 20;
  return (
    <div
      style={{
        position: "absolute",
        left: b.x,
        top: b.y,
        width: b.w,
        height: b.h,
        transform: `rotate(${rotate}deg) scaleX(${flipY})`,
      }}
    >
      <div style={{ position: "absolute", inset: 0, clipPath: clip, overflow: "hidden", ...fillStyle(fill) }}>
        {children ? children(b.w, b.h) : null}
      </div>
      <svg
        width={b.w + pad * 2}
        height={b.h + pad * 2}
        viewBox={`${-pad} ${-pad} ${b.w + pad * 2} ${b.h + pad * 2}`}
        style={{ position: "absolute", left: -pad, top: -pad, overflow: "visible", opacity: borderOpacity }}
      >
        {/* 重なったとき用の白いふち（コマ間の余白の続き） */}
        {borderDraw >= 1 ? <polygon points={pts} fill="none" stroke={C.white} strokeWidth={B + 14} strokeLinejoin="miter" /> : null}
        <polygon
          points={pts}
          fill="none"
          stroke={C[borderColor]}
          strokeWidth={B}
          strokeLinejoin="miter"
          pathLength={1}
          strokeDasharray={borderDraw < 1 ? `${borderDraw} 1` : undefined}
        />
        {crack > 0 ? <FrameCrack w={b.w} h={b.h} progress={crack} /> : null}
      </svg>
    </div>
  );
};

/** 枠のヒビ（上辺から内側へ走る） */
const FrameCrack: React.FC<{ w: number; h: number; progress: number }> = ({ w, h, progress }) => {
  const path: [number, number][] = [
    [w * 0.62, 0],
    [w * 0.58, h * 0.12],
    [w * 0.66, h * 0.2],
    [w * 0.6, h * 0.34],
    [w * 0.68, h * 0.46],
    [w * 0.63, h * 0.62],
  ];
  const branch: [number, number][] = [
    [w * 0.66, h * 0.2],
    [w * 0.78, h * 0.26],
    [w * 0.84, h * 0.22],
  ];
  const cut = (pts: [number, number][], p: number) => {
    const n = Math.max(1, Math.ceil(p * (pts.length - 1)));
    return pts.slice(0, n + 1).map(([x, y]) => `${x},${y}`).join(" ");
  };
  return (
    <g>
      <polyline points={cut(path, progress)} fill="none" stroke={C.black} strokeWidth={10} />
      <polyline points={cut(path, progress)} fill="none" stroke={C.white} strokeWidth={3} />
      {progress > 0.5 ? (
        <>
          <polyline points={cut(branch, (progress - 0.5) * 2)} fill="none" stroke={C.black} strokeWidth={8} />
          <polyline points={cut(branch, (progress - 0.5) * 2)} fill="none" stroke={C.white} strokeWidth={2} />
        </>
      ) : null}
    </g>
  );
};

export type Crop = "full" | "bust" | "face" | "mouth";

/** コマ内のキャラ配置（全身／バスト／顔のみ）。p はコマ内の経過 0〜1（低速ズーム用） */
export const charaGeom = (id: string, w: number, h: number, crop: Crop, flip = false, align = 0.5) => {
  const img = getImage(id);
  const key = id.replace(/-cutout$/, "");
  const face = CONFIG.faces[key] ?? { eyes: [0.5, 0.3], mouth: [0.5, 0.35] };
  const ar = (img.width ?? 1) / (img.height ?? 1);
  let ih: number;
  let focus: [number, number];
  let fy: number;
  if (crop === "full") {
    ih = h * 0.96;
    focus = [0.5, 0.5];
    fy = h * 0.52;
  } else if (crop === "bust") {
    ih = Math.max(h * 1.9, (w * 1.05) / ar);
    focus = face.eyes as [number, number];
    fy = h * 0.36;
  } else if (crop === "face") {
    ih = Math.max(h * 3.6, (w * 1.6) / ar);
    focus = face.eyes as [number, number];
    fy = h * 0.46;
  } else {
    ih = Math.max(h * 6, (w * 2.6) / ar);
    focus = face.mouth as [number, number];
    fy = h * 0.5;
  }
  const iw = ih * ar;
  const fx = flip ? 1 - focus[0] : focus[0];
  return { img, iw, ih, left: w * align - fx * iw, top: fy - focus[1] * ih, ox: fx, oy: focus[1] };
};

export const Chara: React.FC<{
  id: string;
  w: number;
  h: number;
  crop?: Crop;
  flip?: boolean;
  zoom?: number; // コマ内の低速ズーム倍率
  align?: number; // 横位置（コマ幅の比率）
  silhouette?: boolean;
  dx?: number;
  dy?: number;
}> = ({ id, w, h, crop = "full", flip = false, zoom = 1, align = 0.5, silhouette = false, dx = 0, dy = 0 }) => {
  const g = charaGeom(id, w, h, crop, flip, align);
  return (
    <Img
      src={g.img.src}
      style={{
        position: "absolute",
        left: g.left + dx,
        top: g.top + dy,
        width: g.iw,
        height: g.ih,
        transformOrigin: `${g.ox * 100}% ${g.oy * 100}%`,
        transform: `${flip ? "scaleX(-1) " : ""}scale(${zoom})`,
        filter: silhouette ? "brightness(0)" : undefined,
      }}
    />
  );
};

/** 対義語タイポ：巨大な漢字1字。ruby は小さな読み */
export const Kanji: React.FC<{
  ch: string;
  w: number;
  h: number;
  color?: ColorKey;
  scale?: number;
  flipX?: number; // 1〜-1（反転の途中は細くなる）
  rotate?: number;
  ruby?: string;
  dx?: number;
  dy?: number;
  outline?: ColorKey;
}> = ({ ch, w, h, color = "black", scale = 1, flipX = 1, rotate = 0, ruby, dx = 0, dy = 0, outline }) => {
  const size = Math.min(w, h) * 0.84;
  return (
    <div
      style={{
        position: "absolute",
        left: w / 2 + dx,
        top: h / 2 + dy,
        transform: `translate(-50%, -50%) rotate(${rotate}deg) scale(${scale * flipX}, ${scale})`,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1,
        color: C[color],
        whiteSpace: "nowrap",
        WebkitTextStroke: outline ? `${size / 40}px ${C[outline]}` : undefined,
        paintOrder: "stroke fill",
        textAlign: "center",
      }}
    >
      {ch}
      {ruby ? (
        <div style={{ position: "absolute", left: "50%", bottom: -size * 0.16, transform: "translateX(-50%)", fontSize: size * 0.14, letterSpacing: "0.3em" }}>
          {ruby}
        </div>
      ) : null}
    </div>
  );
};

/** 縦書きテキストの大きさの目安 */
const textBlock = (text: string, size: number) => {
  const lines = text.split("\n");
  const longest = Math.max(...lines.map((l) => [...l].length));
  return { cols: lines.length, w: lines.length * size * 1.25, h: longest * size * 1.04 };
};

/**
 * 吹き出し（縦書き）。表の私＝白フキダシ＋黒文字、裏の私＝黒フキダシ＋白文字。
 * (x, y) は吹き出しの中心、tail はしっぽの先（ページ座標）
 */
export const Bubble: React.FC<{
  x: number;
  y: number;
  text: string;
  ura?: boolean;
  size?: number;
  tail?: [number, number];
  scale?: number;
  rotate?: number;
  spiky?: boolean; // 叫び（トゲ）
}> = ({ x, y, text, ura = false, size = 48, tail, scale = 1, rotate = 0, spiky = false }) => {
  const tb = textBlock(text, size);
  const bw = tb.w + size * 2.2;
  const bh = tb.h + size * 2.0;
  const fill = ura ? C.black : C.white;
  const ink = ura ? C.white : C.black;
  const pad = 400;
  const tx = tail ? tail[0] - x : 0;
  const ty = tail ? tail[1] - y : 0;
  // しっぽの付け根（中心から先の方向へ楕円の内側）
  const ang = Math.atan2(ty, tx);
  const baseW = size * 0.7;
  const bx = Math.cos(ang) * bw * 0.32;
  const by = Math.sin(ang) * bh * 0.32;
  const px = -Math.sin(ang) * baseW;
  const py = Math.cos(ang) * baseW;
  let shape: React.ReactNode;
  if (spiky) {
    const n = 18;
    const pts = Array.from({ length: n * 2 }, (_, i) => {
      const a = (i / (n * 2)) * Math.PI * 2;
      const r = i % 2 ? 1 : 1.18;
      return `${Math.cos(a) * (bw / 2) * r},${Math.sin(a) * (bh / 2) * r}`;
    }).join(" ");
    shape = <polygon points={pts} fill={fill} stroke={C.black} strokeWidth={6} strokeLinejoin="miter" />;
  } else {
    shape = <ellipse cx={0} cy={0} rx={bw / 2} ry={bh / 2} fill={fill} stroke={ura ? C.white : C.black} strokeWidth={6} />;
  }
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rotate}deg) scale(${scale})` }}>
      <svg width={pad * 2} height={pad * 2} viewBox={`${-pad} ${-pad} ${pad * 2} ${pad * 2}`} style={{ position: "absolute", left: -pad, top: -pad, overflow: "visible" }}>
        {tail ? (
          <polygon
            points={`${bx + px},${by + py} ${tx},${ty} ${bx - px},${by - py}`}
            fill={fill}
            stroke={ura ? C.white : C.black}
            strokeWidth={6}
            strokeLinejoin="miter"
          />
        ) : null}
        {shape}
        {tail && !spiky ? <ellipse cx={bx * 0.6} cy={by * 0.6} rx={baseW * 1.4} ry={baseW * 1.4} fill={fill} /> : null}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          transform: "translate(-50%, -50%)",
          writingMode: "vertical-rl",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.25,
          color: ink,
          whiteSpace: "pre",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** 四角いナレーション枠（地の文、縦書き）。(x, y) は枠の右上 */
export const Narration: React.FC<{ x: number; y: number; text: string; size?: number; dark?: boolean; opacity?: number; horizontal?: boolean }> = ({
  x,
  y,
  text,
  size = 40,
  dark = false,
  opacity = 1,
  horizontal = false,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: horizontal ? "translate(-50%, 0)" : "translate(-100%, 0)",
      padding: `${size * 0.55}px ${size * 0.5}px`,
      background: dark ? C.black : C.white,
      border: `5px solid ${dark ? C.white : C.black}`,
      writingMode: horizontal ? undefined : "vertical-rl",
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.3,
      letterSpacing: "0.06em",
      color: dark ? C.white : C.black,
      whiteSpace: "pre",
      opacity,
    }}
  >
    {text}
  </div>
);

/** 回る「あまのじゃく」の文字（心の針の代わり） */
export const TextRing: React.FC<{ w: number; h: number; angle: number; r?: number; color?: ColorKey; size?: number; text?: string }> = ({
  w,
  h,
  angle,
  r,
  color = "black",
  size,
  text = "あまのじゃく・あまのじゃく・あまのじゃく・",
}) => {
  const R = r ?? Math.min(w, h) * 0.36;
  const fs = size ?? R * 0.24;
  const id = `ring-${Math.round(R)}-${color}`;
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <path id={id} d={`M ${w / 2} ${h / 2} m -${R} 0 a ${R} ${R} 0 1 1 ${R * 2} 0 a ${R} ${R} 0 1 1 -${R * 2} 0`} />
      </defs>
      <g transform={`rotate(${angle} ${w / 2} ${h / 2})`}>
        <text fontFamily={FONT} fontWeight={900} fontSize={fs} fill={C[color]} letterSpacing={fs * 0.08}>
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </g>
    </svg>
  );
};

/** ページ（白い紙） */
export const PageBg: React.FC<{ color?: ColorKey }> = ({ color = "white" }) => <AbsoluteFill style={{ backgroundColor: C[color] }} />;

/** ステージ背景（素材08）をコマ背景として切り分けて使う。part は切り出す位置（比率） */
export const StageBg: React.FC<{ w: number; h: number; part?: [number, number]; zoom?: number }> = ({ w, h, part = [0.5, 0.45], zoom = 1.6 }) => {
  const img = getImage(CONFIG.cast.m08);
  const ar = (img.width ?? 1) / (img.height ?? 1);
  const ih = Math.max(h, w / ar) * zoom;
  const iw = ih * ar;
  return (
    <Img
      src={img.src}
      style={{ position: "absolute", width: iw, height: ih, left: w / 2 - part[0] * iw, top: h / 2 - part[1] * ih }}
    />
  );
};

export type { Box };
