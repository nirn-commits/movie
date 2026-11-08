import {
  AbsoluteFill,
  Audio,
  Composition,
  Img,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { getAudio, getImage } from "./lib/assets";

// テキスト・色・数字・素材 id はすべて CONFIG（= defaultProps）に置く
const CONFIG = {
  fps: 30,
  durationSec: 3,
  width: 1280,
  height: 720,
  imageId: "sample-test-image",
  audioId: "sample-test-tone",
  label: "ASSET TEST",
  textColor: "#F2EFE9",
  bgColor: "#14161F",
  fadeInFrames: 15,
  zoomFrom: 0.9,
  zoomTo: 1.0,
  labelSize: 28,
  labelTracking: 4,
};

type Props = typeof CONFIG;

export const SampleAssetsTest: React.FC<Props> = (p) => {
  const frame = useCurrentFrame();
  const image = getImage(p.imageId);
  const tone = getAudio(p.audioId);
  const total = p.durationSec * p.fps;

  const opacity = interpolate(frame, [0, p.fadeInFrames], [0, 1], {
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, total - 1], [p.zoomFrom, p.zoomTo]);
  const labelY = interpolate(frame, [0, p.fadeInFrames * 2], [40, 0], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: p.bgColor }}>
      <Img
        src={image.src}
        style={{ width: "100%", height: "100%", opacity, transform: `scale(${scale})` }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 48,
          color: p.textColor,
          fontFamily: "sans-serif",
          fontSize: p.labelSize,
          letterSpacing: p.labelTracking,
          whiteSpace: "nowrap",
          textAlign: "center",
          opacity,
          transform: `translateY(${labelY}px)`,
        }}
      >
        {p.label} · {image.id} · {tone.id}
      </AbsoluteFill>
      <Audio src={tone.src} />
    </AbsoluteFill>
  );
};

export const SampleComposition = () => (
  <Composition
    id="SampleAssetsTest"
    component={SampleAssetsTest}
    durationInFrames={CONFIG.durationSec * CONFIG.fps}
    fps={CONFIG.fps}
    width={CONFIG.width}
    height={CONFIG.height}
    defaultProps={CONFIG}
  />
);
