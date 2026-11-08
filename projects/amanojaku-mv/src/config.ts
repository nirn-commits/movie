/**
 * あまのじゃくじゃく MV — CONFIG
 * 時刻はすべて「曲の秒」。区間・歌詞・色・速度・素材 id はここだけで管理する。
 * 歌詞は音声認識からの推定（briefs/amanojaku-mv.md 参照）。
 */
export const CONFIG = {
  // 書き出し
  fps: 30,
  width: 1920,
  height: 1080,
  songId: "bgm-amanojaku-jaku",
  songDurationSec: 191.664,
  title: "あまのじゃくじゃく",

  // 色は3色だけ
  color: {
    white: "#F6F2F2",
    black: "#111014",
    pink: "#C42A5F",
  },

  fonts: {
    display: { family: "Dela Gothic One", id: "dela-gothic-one", weight: "400" },
    body: { family: "Zen Kaku Gothic New", id: "zen-kaku-gothic-new-medium", weight: "500" },
    heavy: { family: "Zen Kaku Gothic New Black", id: "zen-kaku-gothic-new-black", weight: "900" },
  },

  // 区間（秒）。境目は歌の入りと拍から決めた
  sections: {
    intro: { from: 0, to: 16.09 },
    verse1: { from: 16.09, to: 29.36 },
    pre1: { from: 29.36, to: 49.6 },
    chorus1: { from: 49.6, to: 65.2 }, // 囁き「……本気にした？」まで
    post: { from: 65.2, to: 77.46 },
    verse2: { from: 77.46, to: 84.26 },
    pre2: { from: 84.26, to: 104.04 },
    bridge: { from: 104.04, to: 116.4 },
    brk: { from: 116.4, to: 145.36 },
    final: { from: 145.36, to: 160.34 },
    outro: { from: 160.34, to: 189.0 },
    title: { from: 189.0, to: 191.664 },
  },

  // 通しモチーフ「心の針」
  needle: {
    imageId: "prop-needle",
    opacity: 0.18,
    widthPx: 640,
    pivot: { x: 180.2 / 407, y: 210.2 / 405 },
    restAngleDeg: -47.4,
    // 区間ごとの回転速度（度/秒）。角度は速度の積分
    speeds: [
      { fromSec: 0, degPerSec: 6 },
      { fromSec: 12.4, degPerSec: 40 },
      { fromSec: 16.09, degPerSec: 30 }, // Verse 1
      { fromSec: 29.36, degPerSec: 60 }, // Pre-Chorus 1
      { fromSec: 49.6, degPerSec: 360 }, // Chorus 1：高速
      { fromSec: 63.9, degPerSec: 0 }, // 「本気にした？」で1拍止まる
      { fromSec: 64.33, degPerSec: 90 }, // Post-Chorus
      { fromSec: 77.46, degPerSec: -45 }, // Verse 2：逆回転（裏）
      { fromSec: 84.26, degPerSec: 120 }, // Pre-Chorus 2
      { fromSec: 104.04, degPerSec: 0 }, // Bridge：止まる
      { fromSec: 116.4, degPerSec: 540 }, // Instrumental Break：暴れる
      { fromSec: 145.36, degPerSec: 480 }, // Final Chorus
      { fromSec: 157.6, degPerSec: 0 }, // 4枚目で止まる
      { fromSec: 160.34, degPerSec: 120 }, // Outro：ここから遅くなる
      { fromSec: 162.08, degPerSec: 60 },
      { fromSec: 163.08, degPerSec: 24 },
      { fromSec: 164.46, degPerSec: 6 }, // 「しーっ」に戻る（Intro と同じ）
      { fromSec: 189.0, degPerSec: 0 },
    ],
  },

  // キャラの顔・口の位置（素材内の比率）。寄りの基準点
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

  // ディレクションの「n枚目」と素材 id の対応（推定）
  cast: {
    first: "chara-sing-shout", // Chorus 1「1枚目」
    third: "chara-back-sitting", // Bridge「3枚目の背中」
    fourth: "chara-smile-tear", // Final Chorus「4枚目」
    fullBody: "chara-fullbody-arms-crossed", // Verse 1「元の全身絵」
    shh: "chara-shh-smile",
  },

  // ===== シーン1：Intro =====
  intro: {
    shhImageId: "chara-shh-smile-cutout" as string | null,
    shhMissingLabel: "素材なし：「しーっ」の絵",
    imageHeightPx: 1100,
    zoomFrom: 1.0,
    zoomTo: 1.12,
    spotCenterYPct: 46,
    spotGlowRadiusPx: 560,
    spotGlowAlpha: 0.16,
    spotRadiusPx: 360,
    spotSoftnessPx: 320,
    spotEdgeAlpha: 0.85,
    spotBreath: 0.04,
    spotBreathPeriodSec: 4,
    flashSec: 12.4,
    flashFrames: 3,
    stageImageId: "bg-stage-curtain",
    stageZoomFrom: 1.0,
    stageZoomTo: 1.05,
    endSec: 16.09,
    // ささやき（暗転部分の下に小さく）
    lines: [
      { from: 1.58, to: 5.2, text: "ねえ、聞こえてる？" },
      { from: 5.94, to: 8.4, text: "……聞こえないふり？" },
      { from: 8.9, to: 10.4, text: "ふふっ" },
      { from: 10.76, to: 12.4, text: "じゃ、もう一回！" },
    ],
  },

  // 歌詞タイポのタイミング（秒）。音声認識の単語位置から
  cue: {
    rightRight: 22.0,
    left: 23.36,
    uragaeshi: 24.88,
    aisou: 25.74,
    honne: 28.16,
    kigyou: 28.48,
    aremo: 29.36,
    doremo: 30.86,
    ippaku: 34.02,
    acchi: [36.52, 36.86, 37.26, 37.68],
    matte: 38.42,
    suki: [39.72, 40.16, 40.58, 41.0], // 好き？（嫌い！）嫌い？（……好き？）
    arara: 41.42,
    seikai: 43.14,
    ayayakoshii: 50.98,
    shio: 52.04,
    waratte: 53.18,
    hari: 55.08,
    chaban: 56.88,
    uso: 58.5,
    hikkuri: 60.34,
    nantene: 61.84,
    honki: 63.9,
    dadada: 68.84,
    acchimo: 70.38,
    yosomi: 72.38,
    neene: 73.36,
    nimai: 79.04,
    sanmai: 79.9,
    nanahenge: 80.84,
    kazu: 82.36,
    orikou: 85.88,
    sonnayo: 87.18,
    shiranpuri: 89.02,
    datte: [90.74, 91.52, 92.02, 92.42],
    doudou: 92.86,
    chotto: [94.5, 94.92, 95.38, 95.82],
    hanashi: 96.12,
    yakusoku: 97.86,
    yaburu: 100.78,
    crack: 102.8,
    bridgeLines: [
      { from: 104.04, to: 104.9, text: "……ねえ。" },
      { from: 104.94, to: 107.8, text: "もしも私が" },
      { from: 108.02, to: 110.9, text: "何も言わなくなったら" },
      { from: 111.1, to: 113.7, text: "そのときは" },
      { from: 113.9, to: 116.2, text: "ちゃんと、聞いてよ。" },
    ],
    brkPink: 126.7,
    brkWhite: 137.01,
    finalLines: [
      { at: 145.36, text: "あまのじゃくじゃく" },
      { at: 147.14, text: "ああ、愛おしい！" },
      { at: 148.06, text: "間違いだらけの模範解答" },
      { at: 149.56, text: "泣いて　笑って　また転んで" },
      { at: 151.08, text: "心の針は止まらない" },
      { at: 152.86, text: "一か八かの大勝負" },
      { at: 154.42, text: "勝ったつもりが負けていて" },
      { at: 156.22, text: "負けたふりして笑ってる" },
    ],
    minuku: 157.6,
    outroSuki: [160.34, 160.96, 161.46, 162.08, 162.68, 163.08, 163.74],
    aa: 164.46, // 「……あ。」ここで「しーっ」に戻る
    imano: 164.92, // 「今の、なし。」
    imanoEcho: 172.28, // 残響の「今の、なし」
    endChord: 189.0,
  },
};

export type Config = typeof CONFIG;

export const sec = (t: number, fps = CONFIG.fps) => Math.round(t * fps);
