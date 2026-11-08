/**
 * 素材読み込みヘルパー
 *
 * assets/manifest.json（node scripts/scan-assets.mjs が生成）を読み、id で素材を引く。
 * コード中でファイル名やパスを直書きしないこと。必ず id 経由で引く。
 *
 * ■ Remotion での使い方（このファイル）
 *   - remotion.config.ts で Config.setPublicDir("../../assets") とし、リポジトリ直下の
 *     assets/ をそのまま public/ として扱う（コピー不要）。
 *   - 返り値の `src` は staticFile() 経由の URL。<Img src>, <Audio src>, <OffthreadVideo src> に渡す。
 *       const img = getImage("hero-eye");   <Img src={img.src} />
 *
 * ■ HyperFrames での使い方
 *   - staticFile() は使わない。HTML から見た相対パスで読む。
 *     projects/<作品名>/index.html からは "../../" + entry.path（例 ../../assets/images/hero-eye.png）。
 *   - manifest.json を fetch して同じ要領で id → path を引く。パスを直書きしない。
 */
import { staticFile } from "remotion";
import manifest from "../../../../assets/manifest.json";

export type AssetType = "image" | "audio" | "video" | "font";
export type AudioRole = "bgm" | "voice" | "sfx";

export type AssetEntry = {
  id: string;
  /** リポジトリルートからのパス（例 assets/images/hero-eye.png） */
  path: string;
  type: AssetType;
  role?: AudioRole;
  format: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  durationSec?: number | null;
  sampleRate?: number | null;
  channels?: number | null;
  fps?: number | null;
  hasAudio?: boolean;
  transcript?: string;
};

export type ResolvedAsset = AssetEntry & {
  /** Remotion で使う URL（staticFile 経由） */
  src: string;
};

const entries = (manifest as { assets: AssetEntry[] }).assets;
const byId = new Map(entries.map((e) => [e.id, e]));

/** "assets/images/x.png" → publicDir（= assets/）からの相対 "images/x.png" */
const toPublicPath = (path: string) => path.replace(/^assets\//, "");

export function getAsset(id: string): ResolvedAsset {
  const entry = byId.get(id);
  if (!entry) {
    const known = entries.map((e) => e.id).join(", ") || "（なし）";
    throw new Error(
      `素材 id "${id}" は assets/manifest.json にありません。node scripts/scan-assets.mjs を実行したか確認してください。登録済み: ${known}`,
    );
  }
  return { ...entry, src: staticFile(toPublicPath(entry.path)) };
}

function getTyped(id: string, type: AssetType): ResolvedAsset {
  const a = getAsset(id);
  if (a.type !== type) {
    throw new Error(`素材 id "${id}" は ${a.type} です（${type} を要求されました）`);
  }
  return a;
}

export const getImage = (id: string) => getTyped(id, "image");
export const getAudio = (id: string) => getTyped(id, "audio");
export const getVideo = (id: string) => getTyped(id, "video");

/** 音声・映像の長さをフレーム数に換算する（尺合わせ用） */
export const durationInFrames = (id: string, fps: number) =>
  Math.round((getAsset(id).durationSec ?? 0) * fps);
