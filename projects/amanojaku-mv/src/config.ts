/**
 * あまのじゃくじゃく MV — CONFIG
 * 時刻はすべて「曲の秒」。フレームへの換算は sec(t) を使う。
 * テキスト・色・数字・BPM・速度・素材 id はここだけで管理する。
 */
export const CONFIG = {
  // 書き出し
  fps: 30,
  width: 1920,
  height: 1080,
  songId: "bgm-amanojaku-jaku",
  songDurationSec: 191.664,

  // 曲の解析値（波形から推定。編集で拍に微調整する）
  bpm: 140.78,
  firstDownbeatSec: 16.09, // バンドが全部入る位置 = Verse 1 の頭

  // 色は3色だけ
  color: {
    white: "#F6F2F2",
    black: "#111014",
    pink: "#C42A5F",
  },

  // 通しモチーフ「心の針」
  needle: {
    opacity: 0.18,
    lengthPx: 760,
    widthPx: 34,
    ringPx: 820,
    // 区間ごとの回転速度（度/秒）。角度は速度の積分なので、どのフレームでも一意に決まる
    speeds: [
      { fromSec: 0, degPerSec: 6 }, // Intro：ゆっくり
      { fromSec: 12.4, degPerSec: 40 }, // ステージへ出た瞬間に速くなる
    ],
  },

  // ===== シーン1：Intro（0 〜 16.09s）=====
  intro: {
    // 「しーっ」の絵：素材未受領。null の間は「素材なし」の仮枠を出す
    shhImageId: null as string | null,
    shhMissingLabel: "素材なし：「しーっ」の絵",
    imageHeightPx: 980,
    zoomFrom: 1.0,
    zoomTo: 1.12,
    spotRadiusPx: 520, // ピンスポットの半径
    spotSoftnessPx: 260, // ピンスポットの縁のぼかし幅
    spotBreath: 0.04, // ピンスポットの明るさの揺らぎ（0〜1）
    spotBreathPeriodSec: 4,
    flashSec: 12.4, // 「じゃ、もう一回！」直後の一撃
    flashFrames: 3, // 白一色を出すフレーム数（フェードなし）
    stageImageId: "bg-stage-curtain",
    stageZoomFrom: 1.0,
    stageZoomTo: 1.05,
    endSec: 16.09,
  },
};

export type Config = typeof CONFIG;

export const sec = (t: number, fps = CONFIG.fps) => Math.round(t * fps);
