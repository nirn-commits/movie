import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { CONFIG } from "../config";
import { getImage } from "../lib/assets";

type Speed = { fromSec: number; degPerSec: number };

/** 区間ごとの一定速度を積分した角度。時刻だけで決まる */
export const needleAngle = (tSec: number, speeds: Speed[]) => {
  let angle = 0;
  for (let i = 0; i < speeds.length; i++) {
    const start = speeds[i].fromSec;
    const end = i + 1 < speeds.length ? speeds[i + 1].fromSec : Infinity;
    if (tSec <= start) break;
    angle += (Math.min(tSec, end) - start) * speeds[i].degPerSec;
  }
  return angle;
};

/** 通しモチーフ「心の針」（素材 prop-needle）。中心リングを軸に回す */
export const Needle: React.FC<{
  x?: number;
  y?: number;
  scale?: number;
  opacity?: number;
  offsetDeg?: number;
}> = ({ x = CONFIG.width / 2, y = CONFIG.height / 2, scale = 1, opacity, offsetDeg = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = CONFIG.needle;
  const img = getImage(n.imageId);
  const w = n.widthPx * scale;
  const h = (w * (img.height ?? 1)) / (img.width ?? 1);
  const angle = n.restAngleDeg + offsetDeg + needleAngle(frame / fps, n.speeds);

  return (
    <AbsoluteFill style={{ opacity: opacity ?? n.opacity }}>
      <Img
        src={img.src}
        style={{
          position: "absolute",
          width: w,
          height: h,
          left: x - w * n.pivot.x,
          top: y - h * n.pivot.y,
          transformOrigin: `${n.pivot.x * 100}% ${n.pivot.y * 100}%`,
          transform: `rotate(${angle}deg)`,
        }}
      />
    </AbsoluteFill>
  );
};
