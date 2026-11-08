import { AbsoluteFill, Audio, Composition, useCurrentFrame, useVideoConfig } from "remotion";
import { CONFIG, sec } from "./config";
import { getAudio } from "./lib/assets";
import { loadFonts } from "./lib/fonts";
import { Intro } from "./scenes/Intro";
import { Pre1, Verse1 } from "./scenes/Verse1Pre1";
import { Chorus1, Post } from "./scenes/Chorus1Post";
import { Pre2, Verse2 } from "./scenes/Verse2Pre2";
import { Break, Bridge, Final, Outro, TitleCard } from "./scenes/BridgeToEnd";

loadFonts();

const SCENES: { key: keyof typeof CONFIG.sections; C: React.FC<{ t: number }> }[] = [
  { key: "intro", C: () => <Intro /> },
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
  { key: "title", C: TitleCard },
];

/** 曲の秒 t で区間を選んで描く（区間の切り替えもハードカット） */
const MV: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const scene = [...SCENES].reverse().find((s) => t >= CONFIG.sections[s.key].from) ?? SCENES[0];
  const song = getAudio(CONFIG.songId);
  return (
    <AbsoluteFill style={{ backgroundColor: CONFIG.color.black }}>
      <scene.C t={t} />
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
