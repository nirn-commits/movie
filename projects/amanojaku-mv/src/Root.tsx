import { AbsoluteFill, Audio, Composition, Sequence } from "remotion";
import { CONFIG, sec } from "./config";
import { getAudio } from "./lib/assets";
import { Intro } from "./scenes/Intro";

const MV: React.FC = () => {
  const song = getAudio(CONFIG.songId);
  return (
    <AbsoluteFill style={{ backgroundColor: CONFIG.color.black }}>
      <Sequence from={0} durationInFrames={sec(CONFIG.intro.endSec)} name="Intro">
        <Intro />
      </Sequence>
      {/* 以降のシーンはラウンドごとに追加する */}
      <Audio src={song.src} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="AmanojakuMV"
      component={MV}
      durationInFrames={sec(CONFIG.songDurationSec)}
      fps={CONFIG.fps}
      width={CONFIG.width}
      height={CONFIG.height}
    />
  </>
);
