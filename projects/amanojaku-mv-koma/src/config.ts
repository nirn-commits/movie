/**
 * あまのじゃくじゃく MV（コマ割り版）— CONFIG
 * 時刻はすべて「曲の秒」。色・書体・素材番号・区間・歌詞の時刻はここだけで管理する。
 */
export const CONFIG = {
  fps: 30,
  width: 1920,
  height: 1080,
  songId: "bgm-amanojaku-jaku",
  songDurationSec: 191.664,
  title: "あまのじゃくじゃく",

  // 色は3色固定
  color: {
    white: "#F7F2EC",
    black: "#141114",
    pink: "#DE2E5A",
  },

  // 書体は1つ（太字ゴシック）
  fonts: {
    main: { family: "Zen Kaku Gothic New Black", id: "zen-kaku-gothic-new-black", weight: "900" },
  },

  // ページ（マンガの1ページ）
  page: {
    margin: 40, // 紙の余白
    gutter: 26, // コマ間の白
    border: 8, // コマ枠の太さ
  },

  // 素材番号 → 素材 id（白背景の絵は切り抜き版を使う）
  cast: {
    base: "chara-fullbody-arms-crossed-cutout", // 元絵（全身しーっ）：未受領のため 05 で代役
    m01: "chara-reach-grin-cutout", // 手を伸ばす：コマ破り1回目専用
    m02: "chara-sing-shout-cutout", // 歌唱：サビのコマ内アップ
    m03: "chara-back-sitting", // 背中：Bridge 専用
    m04: "chara-smile-tear-cutout", // 涙目の笑顔：枠なし全面専用
    m05: "chara-fullbody-arms-crossed-cutout", // 腕組み：Pre の不機嫌フキダシ用
    m06: "chara-surprised-hands-cutout", // 驚き：「本気にした？」と「……あ。」のみ
    m07: "chara-point-angry-cutout", // 横顔：掛け合いの言い返し（反転で裏の私）
    m08: "bg-stage-curtain", // ステージ背景：Chorus のコマ背景
    m09: "chara-shh-smile-cutout", // しーっ寄り：企業秘密、Outro
    m10: "chara-shh-smile-cutout", // しーっ黒：未受領のため 09 の切り抜きを黒地に置いて代役
  },

  // 顔（目）と口の位置（素材内の比率）。バスト・顔のみの切り抜きの基準点
  faces: {
    "chara-shh-smile": { eyes: [0.515, 0.36], mouth: [0.51, 0.43] },
    "chara-point-angry": { eyes: [0.47, 0.205], mouth: [0.4, 0.255] },
    "chara-surprised-hands": { eyes: [0.495, 0.35], mouth: [0.49, 0.42] },
    "chara-fullbody-arms-crossed": { eyes: [0.548, 0.19], mouth: [0.54, 0.24] },
    "chara-smile-tear": { eyes: [0.525, 0.245], mouth: [0.52, 0.3] },
    "chara-sing-shout": { eyes: [0.58, 0.29], mouth: [0.53, 0.37] },
    "chara-reach-grin": { eyes: [0.526, 0.222], mouth: [0.52, 0.27] },
    "chara-back-sitting": { eyes: [0.53, 0.45], mouth: [0.53, 0.45] },
  } as Record<string, { eyes: [number, number]; mouth: [number, number] }>,

  // 01 の伸ばした手の範囲（素材内の比率）。コマ破りで枠の外に出す部分
  reachHand: { x0: 0.0, y0: 0.33, x1: 0.44, y1: 0.52 },

  // 区間（公式歌詞の構成に合わせる）
  sections: {
    intro: { from: 0, to: 16.09 },
    verse1: { from: 16.09, to: 36.52 },
    pre1: { from: 36.52, to: 49.6 },
    chorus1: { from: 49.6, to: 65.2 },
    post: { from: 65.2, to: 77.46 },
    verse2: { from: 77.46, to: 90.74 },
    pre2: { from: 90.74, to: 104.04 },
    bridge: { from: 104.04, to: 116.4 },
    brk: { from: 116.4, to: 145.36 },
    final: { from: 145.36, to: 160.34 },
    outro: { from: 160.34, to: 191.664 },
  },

  // 歌詞の時刻（音声認識の単語位置から推定）
  cue: {
    intro: [
      { at: 1.58, text: "ねえ、聞こえてる？" },
      { at: 5.94, text: "……聞こえないふり？" },
      { at: 8.9, text: "ふふっ" },
      { at: 10.76, text: "じゃ、もう一回！" },
    ],
    introSplit: 12.4,
    v1: {
      migi: 22.0,
      hidari: 23.36,
      gokigen: 24.04,
      uragaeshi: 24.88,
      aisou: 25.74,
      honne: 27.82,
      aremo: 29.36,
      doremo: 30.86,
      yotei: 32.48,
      ippaku: 34.02,
    },
    pre1: {
      acchi: [36.52, 36.86, 37.26, 37.68],
      matte: 38.42,
      suki: [39.72, 40.16, 40.58, 41.0],
      arara: 41.42,
      seikai: 43.14,
      dare: 45.1,
    },
    ch1: {
      ayaya: 50.98,
      shio: 52.04,
      waratte: 53.18,
      hari: 55.08,
      chaban: 56.88,
      uso: 58.5,
      hikkuri: 60.34,
      nantene: [61.84, 62.38, 63.12],
      honki: 63.9,
    },
    post: { da: 68.84, acchimo: 70.38, yosomi: 72.38 },
    v2: {
      neko: 77.46,
      nimai: 79.04,
      sanmai: 79.9,
      nana: 80.84,
      kazu: 82.36,
      gyougi: 84.26,
      orikou: 85.88,
      sonna: 87.18,
      dakara: 89.02,
    },
    pre2: {
      datte: [90.74, 91.52, 92.02, 92.42],
      doudou: 92.86,
      chotto: [94.5, 94.92, 95.38, 95.82],
      hanashi: 96.12,
      yakusoku: 97.86,
      yaburu: 100.78,
      crack: 102.8,
    },
    bridge: [
      { from: 104.04, to: 104.9, text: "……ねえ。" },
      { from: 104.94, to: 107.8, text: "もしも私が" },
      { from: 108.02, to: 110.9, text: "何も言わなくなったら" },
      { from: 111.1, to: 113.7, text: "そのときは" },
      { from: 113.9, to: 116.2, text: "ちゃんと、聞いてよ。" },
    ],
    brk: { pink: 126.7, black: 137.01, shadow: 143.6 },
    fin: {
      itoshii: 147.14,
      machigai: 148.06,
      naite: 149.56,
      hari: 151.08,
      ichika: 152.86,
      katta: 154.42,
      maketa: 156.22,
      minuku: 157.6,
    },
    outro: {
      suki: [160.34, 160.96, 161.46, 162.08, 162.68, 163.08, 163.74],
      aa: 164.46,
      imano: 164.92,
      imanoEcho: 172.28,
      chord: 189.0,
      titleSec: 1.5,
    },
  },
};

export const sec = (t: number, fps = CONFIG.fps) => Math.round(t * fps);
export type ColorKey = keyof typeof CONFIG.color;
