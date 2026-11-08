#!/usr/bin/env node
// assets/ 以下を走査して assets/manifest.json と assets/INDEX.md を再生成する。
// 使い方：node scripts/scan-assets.mjs（引数なし）
// 依存：Node 22 以上のみ。音声・動画・ラスター画像の情報は ffprobe（FFmpeg 同梱）で取得する。

import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "node:fs";
import { join, relative, extname, basename, dirname, sep, posix } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ASSETS = join(ROOT, "assets");

const TYPES = {
  image: ["png", "jpg", "jpeg", "webp", "svg"],
  audio: ["mp3", "wav", "m4a", "flac"],
  video: ["mp4", "mov"],
  font: ["woff2", "ttf", "otf"],
};
const SKIP = new Set([".gitkeep", "INDEX.md", "manifest.json", ".DS_Store"]);
const NAME_RULE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const typeOf = (ext) => Object.keys(TYPES).find((t) => TYPES[t].includes(ext)) ?? null;
const toPosix = (p) => p.split(sep).join(posix.sep);

let hasFfprobe = true;
try {
  execFileSync("ffprobe", ["-version"], { stdio: "ignore" });
} catch {
  hasFfprobe = false;
}

function probe(file) {
  if (!hasFfprobe) return null;
  try {
    const out = execFileSync(
      "ffprobe",
      ["-v", "error", "-show_format", "-show_streams", "-of", "json", file],
      { encoding: "utf8" },
    );
    return JSON.parse(out);
  } catch {
    return null;
  }
}

const round = (n, d = 3) => (Number.isFinite(n) ? Math.round(n * 10 ** d) / 10 ** d : null);

function fps(rate) {
  if (!rate || rate === "0/0") return null;
  const [a, b] = rate.split("/").map(Number);
  return round(b ? a / b : a, 3);
}

function svgSize(file) {
  const src = readFileSync(file, "utf8").slice(0, 4000);
  const tag = src.match(/<svg\b[^>]*>/i)?.[0] ?? "";
  const num = (attr) => {
    const m = tag.match(new RegExp(`\\b${attr}="([\\d.]+)(px)?"`));
    return m ? Number(m[1]) : null;
  };
  let w = num("width");
  let h = num("height");
  const vb = tag.match(/viewBox="([^"]+)"/)?.[1].trim().split(/[\s,]+/).map(Number);
  if ((!w || !h) && vb?.length === 4) [w, h] = [vb[2], vb[3]];
  return { width: w, height: h };
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

const entries = [];
const warnings = [];

for (const file of walk(ASSETS).sort()) {
  const name = basename(file);
  if (SKIP.has(name)) continue;
  const ext = extname(name).slice(1).toLowerCase();
  if (ext === "txt") continue; // 台本・文字起こし（音声の transcript として紐づける）

  const rel = toPosix(relative(ROOT, file));
  const id = basename(name, extname(name));
  const type = typeOf(ext);
  if (!type) {
    warnings.push(`対応外の形式のため除外：${rel}`);
    continue;
  }
  if (!NAME_RULE.test(id)) warnings.push(`ファイル名が kebab-case ではありません：${rel}`);

  const parts = rel.split("/"); // assets/<type>/<role>/...
  const role = type === "audio" ? (["bgm", "voice", "sfx"].includes(parts[2]) ? parts[2] : null) : null;

  const entry = { id, path: rel, type };
  if (role) entry.role = role;
  entry.format = ext;
  entry.sizeBytes = statSync(file).size;

  if (type === "image") {
    if (ext === "svg") {
      Object.assign(entry, svgSize(file));
    } else {
      const v = probe(file)?.streams?.find((s) => s.codec_type === "video");
      entry.width = v?.width ?? null;
      entry.height = v?.height ?? null;
    }
  } else if (type === "audio" || type === "video") {
    const info = probe(file);
    const a = info?.streams?.find((s) => s.codec_type === "audio");
    const v = info?.streams?.find((s) => s.codec_type === "video" && !s.disposition?.attached_pic);
    entry.durationSec = round(Number(info?.format?.duration), 3);
    if (type === "video") {
      entry.width = v?.width ?? null;
      entry.height = v?.height ?? null;
      entry.fps = fps(v?.avg_frame_rate || v?.r_frame_rate);
      entry.hasAudio = Boolean(a);
    }
    entry.sampleRate = a ? Number(a.sample_rate) : null;
    entry.channels = a ? a.channels : null;
    if (!info) warnings.push(`ffprobe で情報を取得できませんでした：${rel}`);
  }

  if (role === "voice") {
    const txt = join(dirname(file), `${id}.txt`);
    if (existsSync(txt)) entry.transcript = toPosix(relative(ROOT, txt));
    else warnings.push(`ナレーションの台本（同名 .txt）がありません：${rel}`);
  }

  entries.push(entry);
}

const seen = new Map();
for (const e of entries) {
  if (seen.has(e.id)) warnings.push(`id が重複しています：${e.id}（${seen.get(e.id)} と ${e.path}）`);
  else seen.set(e.id, e.path);
}
if (!hasFfprobe) warnings.push("ffprobe が見つからないため、長さ・解像度などは空欄です");

const manifest = {
  generatedBy: "scripts/scan-assets.mjs",
  count: entries.length,
  assets: entries,
};
writeFileSync(join(ASSETS, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

// ---- INDEX.md ----
const kb = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const dim = (e) => (e.width && e.height ? `${e.width}×${e.height}` : "—");
const sec = (e) => (e.durationSec != null ? `${e.durationSec}s` : "—");
const audio = (e) => (e.sampleRate ? `${e.sampleRate}Hz / ${e.channels}ch` : "—");

const sections = [
  ["画像", (e) => e.type === "image", ["id", "パス", "形式", "サイズ", "幅×高さ"], (e) => [e.id, e.path, e.format, kb(e.sizeBytes), dim(e)]],
  ["BGM", (e) => e.role === "bgm", ["id", "パス", "形式", "サイズ", "長さ", "音声"], (e) => [e.id, e.path, e.format, kb(e.sizeBytes), sec(e), audio(e)]],
  ["ナレーション", (e) => e.role === "voice", ["id", "パス", "長さ", "音声", "台本"], (e) => [e.id, e.path, sec(e), audio(e), e.transcript ?? "（なし）"]],
  ["効果音", (e) => e.role === "sfx", ["id", "パス", "形式", "サイズ", "長さ", "音声"], (e) => [e.id, e.path, e.format, kb(e.sizeBytes), sec(e), audio(e)]],
  ["その他の音声", (e) => e.type === "audio" && !e.role, ["id", "パス", "長さ", "音声"], (e) => [e.id, e.path, sec(e), audio(e)]],
  ["映像", (e) => e.type === "video", ["id", "パス", "形式", "サイズ", "長さ", "幅×高さ", "fps", "音声"], (e) => [e.id, e.path, e.format, kb(e.sizeBytes), sec(e), dim(e), e.fps ?? "—", e.hasAudio ? audio(e) : "なし"]],
  ["フォント", (e) => e.type === "font", ["id", "パス", "形式", "サイズ"], (e) => [e.id, e.path, e.format, kb(e.sizeBytes)]],
];

const md = [
  "# 素材一覧（自動生成）",
  "",
  "> このファイルは `node scripts/scan-assets.mjs` で再生成されます。手で編集しないでください。",
  "> コードからは必ず **id** で参照します（ファイル名・パスを直書きしない）。",
  "",
  `合計：${entries.length} 件`,
  "",
];
for (const [title, pick, head, row] of sections) {
  const list = entries.filter(pick);
  md.push(`## ${title}（${list.length}）`, "");
  if (!list.length) {
    md.push("（なし）", "");
    continue;
  }
  md.push(`| ${head.join(" | ")} |`, `|${head.map(() => "---").join("|")}|`);
  for (const e of list) md.push(`| ${row(e).map((c, i) => (i < 2 ? `\`${c}\`` : c)).join(" | ")} |`);
  md.push("");
}
md.push("## 警告", "");
md.push(...(warnings.length ? warnings.map((w) => `- ${w}`) : ["（なし）"]), "");
writeFileSync(join(ASSETS, "INDEX.md"), md.join("\n"));

console.log(`manifest.json / INDEX.md を更新しました（${entries.length} 件）`);
for (const w of warnings) console.warn(`警告：${w}`);
