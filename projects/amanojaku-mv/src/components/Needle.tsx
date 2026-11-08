import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { CONFIG } from "../config";

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

/** 通しモチーフ「心の針」。表(ピンク)と裏(黒/白)で半分ずつ塗り分けたコンパスの針 */
export const Needle: React.FC<{ tone: "onDark" | "onLight" }> = ({ tone }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const n = CONFIG.needle;
  const c = CONFIG.color;
  const angle = needleAngle(frame / fps, n.speeds);
  const back = tone === "onDark" ? c.white : c.black;
  const L = n.lengthPx / 2;
  const W = n.widthPx / 2;
  const R = n.ringPx / 2;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: n.opacity }}>
      <svg width={n.ringPx + 40} height={n.ringPx + 40} viewBox={`${-R - 20} ${-R - 20} ${n.ringPx + 40} ${n.ringPx + 40}`}>
        <circle r={R} fill="none" stroke={back} strokeWidth={3} />
        {Array.from({ length: 24 }, (_, i) => (
          <line
            key={i}
            x1={0}
            y1={-R}
            x2={0}
            y2={-R + (i % 6 === 0 ? 34 : 14)}
            stroke={back}
            strokeWidth={i % 6 === 0 ? 4 : 2}
            transform={`rotate(${i * 15})`}
          />
        ))}
        <g transform={`rotate(${angle})`}>
          <polygon points={`0,${-L} ${W},0 ${-W},0`} fill={c.pink} />
          <polygon points={`0,${L} ${W},0 ${-W},0`} fill={back} />
          <circle r={W * 0.7} fill={back} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
