# claude-video-workspace

Claude Code に**コードで動画を作らせる**ためのワークスペースです。監督（あなた）は brief と素材をチャットで渡すだけで、配置・実装・レンダリング・確認は Claude Code が行います。

## 前提
- Node.js 22 以上 / FFmpeg（ffprobe 含む） / Git LFS / Claude Code
- `bash scripts/setup.sh` で前提チェックと公式スキル（HyperFrames・Remotion）の追加を行います

## 新しい動画の作り方
1. **素材を渡す**：画像・音声・映像・フォントをチャットに添付する → Claude Code がリネーム・配置・一覧更新・コミットまで行い、id を返す
2. **brief を伝える**：目的・サイズ・長さ・色・使う素材 id・タイムライン（`briefs/BRIEF.template.md` の項目）
3. **シーン1を確認**：静止画3枚がチャットに出るので、数値で1点ずつ直す
4. **書き出し**：全シーンが通ったら `out/<作品名>.mp4` にレンダリングし、尺・サイズ・音声を確認して報告

## 置き場所

| 場所 | 置くもの |
|---|---|
| `briefs/` | 作品ごとの仕様書 |
| `assets/INDEX.md` / `manifest.json` | 素材一覧（自動生成。まずこれを読む） |
| `assets/images/` | png / jpg / webp / svg |
| `assets/audio/bgm/` `voice/` `sfx/` | BGM / ナレーション（同名 .txt に台本） / 効果音 |
| `assets/video/` | mp4 / mov |
| `assets/fonts/` | woff2 / ttf / otf |
| `projects/` | 作品のコード（`_template-*` が雛形、`_sample-assets-test` が実証サンプル） |
| `out/` | 書き出した動画（git 管理外） |
| `scripts/` | `setup.sh`、`scan-assets.mjs` |
| `docs/skills.md` | 使えるスキル一覧 |

## 素材のルール
- ファイル名は kebab-case（英小文字・数字・ハイフン）。ファイル名から拡張子を除いたものが **id**
- コードからは id で引く（`getImage("hero-eye")`）。パスを直書きしない
- 一覧更新は `node scripts/scan-assets.mjs`（引数なし）
- wav / mp3 / flac / mp4 / mov は Git LFS で管理。書き出し物は Git に入れない

## 描画のルール
- 動きはフレーム／時刻の関数のみ（CSS transition・`Date.now()`・`Math.random()` 禁止）
- テキスト・色・数字・BPM・速度は CONFIG / props に分離
- ラウンド制：シーン1 → 静止画3枚 → チェック → 次へ

詳細は [CLAUDE.md](CLAUDE.md)。
