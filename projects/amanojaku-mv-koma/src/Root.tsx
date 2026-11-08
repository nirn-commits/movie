import { AbsoluteFill, Audio, Composition, useCurrentFrame, useVideoConfig } from "remotion";
import { CONFIG, sec } from "./config";
import { getAudio } from "./lib/assets";
import { loadFonts } from "./lib/fonts";
import { Intro, Verse1 } from "./sections/IntroVerse1";
import { Chorus1, Pre1 } from "./sections/Pre1Chorus1";
import { Post, Pre2, Verse2 } from "./sections/PostVerse2Pre2";
import { Break, Bridge, Final, Outro } from "./sections/BridgeToEnd";

loadFonts();

const SCENES: { key: keyof typeof CONFIG.sections; C: React.FC<{ t: number }> }[] = [
  { key: "intro", C: Intro },
  { key: "verse1", C: Verse1 },
  { key: "pre1", C: Pre1 },
  { key: "chorus1", C: Chorus1 },
  { key: "post", C: Post },
  { key: "verse2", C: Verse2 },
  { key: "pre2", C: Pre2 },
  { key: "bridge", C: Bridge },
  { key: "brk", C: Break },
  { key: "final", C: Final },
  { key: "outro", C: Outro },
];

/** 曲の秒 t で区間を選び、その区間のページ（コマ割り）を描く */
const MV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const scene = [...SCENES].reverse().find((s) => t >= CONFIG.sections[s.key].from) ?? SCENES[0];
  const song = getAudio(CONFIG.songId);
  return (
    <AbsoluteFill style={{ backgroundColor: CONFIG.color.white }}>
      <scene.C t={t} />
      <Audio src={song.src} />
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => (
  <Composition
    id="AmanojakuKoma"
    component={MV}
    durationInFrames={sec(CONFIG.songDurationSec)}
    fps={CONFIG.fps}
    width={CONFIG.width}
    height={CONFIG.height}
  />
);
