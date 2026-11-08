import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CONFIG, sec } from "../config";
import { getImage } from "../lib/assets";
import { Needle } from "../components/Needle";
import { Typo } from "../components/kit";

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
    }}
  >
    {label}
  </div>
);

/** 黒背景＋ピンスポットの「しーっ」。Intro と Outro で共用 */
export const ShhSpot: React.FC<{ zoom: number }> = ({ zoom }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = CONFIG.intro;
  const c = CONFIG.color;
  const breath = 1 - p.spotBreath * (0.5 + 0.5 * Math.sin((2 * Math.PI * frame) / (p.spotBreathPeriodSec * fps)));
  const inner = p.spotRadiusPx;
  const outer = p.spotRadiusPx + p.spotSoftnessPx;
  const cy = `${p.spotCenterYPct}%`;
  return (
    <AbsoluteFill style={{ backgroundColor: c.black }}>
      {/* 背後：ピンスポットが当たった光の円 */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% ${cy}, rgba(255,255,255,${p.spotGlowAlpha * breath}) 0px, rgba(255,255,255,0) ${p.spotGlowRadiusPx}px)`,
        }}
      />
      <Needle />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${zoom})` }}>
        {p.shhImageId ? (
          <Img src={getImage(p.shhImageId).src} style={{ height: p.imageHeightPx }} />
        ) : (
          <MissingFrame label={p.shhMissingLabel} height={p.imageHeightPx} />
        )}
      </AbsoluteFill>
      {/* 手前：スポットの外を黒に落とす */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% ${cy}, rgba(0,0,0,0) ${inner}px, rgba(17,16,20,${p.spotEdgeAlpha}) ${outer}px)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** シーン1：黒＋ピンスポットの「しーっ」→ 白フラッシュ → ステージ */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = CONFIG.intro;
  const c = CONFIG.color;
  const flashStart = sec(p.flashSec, fps);
  const flashEnd = flashStart + p.flashFrames;

  if (frame >= flashStart && frame < flashEnd) {
    return <AbsoluteFill style={{ backgroundColor: c.white }} />;
  }

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
        <Needle />
      </AbsoluteFill>
    );
  }

  const t = frame / fps;
  const line = p.lines.find((l) => t >= l.from && t < l.to);
  return (
    <AbsoluteFill>
      <ShhSpot zoom={interpolate(frame, [0, flashStart], [p.zoomFrom, p.zoomTo])} />
      {line ? <Typo text={line.text} y={CONFIG.height * 0.92} size={40} color="white" font="body" tracking={0.2} /> : null}
    </AbsoluteFill>
  );
};
