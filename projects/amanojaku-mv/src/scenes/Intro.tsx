import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CONFIG, sec } from "../config";
import { getImage } from "../lib/assets";
import { Needle } from "../components/Needle";

/** 素材が届くまでの仮枠。代用の絵は使わない */
const MissingFrame: React.FC<{ label: string; height: number }> = ({ label, height }) => (
  <div
    style={{
      height,
      width: Math.round((height * 1248) / 1824),
      border: `4px dashed ${CONFIG.color.pink}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: CONFIG.color.white,
      fontFamily: "sans-serif",
      fontSize: 40,
      textAlign: "center",
      lineHeight: 1.6,
      padding: 40,
      boxSizing: "border-box",
    }}
  >
    {label}
  </div>
);

/** シーン1：黒＋ピンスポットの「しーっ」→ 白フラッシュ → ステージ */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = CONFIG.intro;
  const c = CONFIG.color;
  const flashStart = sec(p.flashSec, fps);
  const flashEnd = flashStart + p.flashFrames;

  // ---- 白フラッシュ（ハードカット） ----
  if (frame >= flashStart && frame < flashEnd) {
    return <AbsoluteFill style={{ backgroundColor: c.white }} />;
  }

  // ---- ステージ（フラッシュ後〜Verse 1 直前） ----
  if (frame >= flashEnd) {
    const stage = getImage(p.stageImageId);
    const scale = interpolate(frame, [flashEnd, sec(p.endSec, fps)], [p.stageZoomFrom, p.stageZoomTo], {
      extrapolateRight: "clamp",
    });
    return (
      <AbsoluteFill style={{ backgroundColor: c.black }}>
        <Img
          src={stage.src}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})` }}
        />
        <Needle tone="onDark" />
      </AbsoluteFill>
    );
  }

  // ---- 黒背景＋ピンスポット ----
  const zoom = interpolate(frame, [0, flashStart], [p.zoomFrom, p.zoomTo]);
  const breath = 1 - p.spotBreath * (0.5 + 0.5 * Math.sin((2 * Math.PI * frame) / (p.spotBreathPeriodSec * fps)));
  const inner = p.spotRadiusPx;
  const outer = p.spotRadiusPx + p.spotSoftnessPx;

  return (
    <AbsoluteFill style={{ backgroundColor: c.black }}>
      <Needle tone="onDark" />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${zoom})` }}>
        {p.shhImageId ? (
          <Img src={getImage(p.shhImageId).src} style={{ height: p.imageHeightPx }} />
        ) : (
          <MissingFrame label={p.shhMissingLabel} height={p.imageHeightPx} />
        )}
      </AbsoluteFill>
      {/* ピンスポット：中心だけ明るく、外側は黒に落とす */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 48%, rgba(0,0,0,0) ${inner}px, ${c.black} ${outer}px)`,
          opacity: breath,
        }}
      />
    </AbsoluteFill>
  );
};
