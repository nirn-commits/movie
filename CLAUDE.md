# CLAUDE.md — 動画ワークスペースでの常時指示

このリポジトリで働く Claude Code は、以下を常に守ってください。ユーザーは監督、あなたは実装者です。
ユーザーにターミナル操作をさせず、git・npm・ffmpeg・レンダリング・確認はすべてあなたが実行します。

## 描画
- 動画は**コードで描く**（HyperFrames / Remotion）。実写・生成映像が要る場合は別工程として提案するに留め、勝手に混ぜない。
- 動きは必ず**フレーム数／時刻の関数**にする。同じフレームは何度描いても同じ絵になること。
- **禁止**：CSS `transition`、`Date.now()`、`Math.random()`（乱数が要るならフレーム／インデックスから計算するシード付き擬似乱数）。
  - **Remotion**：`useCurrentFrame()` + `interpolate()`（必要なら `spring()`）
  - **HyperFrames**：`paused` で seek 可能な**単一タイムライン**（既定は GSAP）
- テキスト・色・数字・BPM・速度・素材 id は **CONFIG / props に分離**し、コードに直書きしない。

## 素材
- 素材を使う前に必ず **`assets/INDEX.md` と `assets/manifest.json` を読む**。ファイル名を推測しない。
  **一覧に無い素材は「無い」と報告する**（代わりの素材をでっち上げない）。
- コードからは必ず **id 経由**で引く（Remotion：`src/lib/assets.ts` の `getImage(id)` など／HyperFrames：manifest の path を相対参照）。
- 外部URLを直接参照しない。必ずリポジトリ内（`assets/`）に置いてから使う。
- ユーザーがチャットに素材を渡したら、あなたが次をすべて行う：
  1. ファイル名を **kebab-case**（英小文字・数字・ハイフンのみ、日本語・スペース・全角なし）にリネーム
     例：`hero-eye.png`、`bgm-main-theme.mp3`、`voice-line-01.wav`
  2. 種類に応じたフォルダへ配置
     - 画像 png/jpg/webp/svg → `assets/images/`
     - BGM → `assets/audio/bgm/`／ナレーション → `assets/audio/voice/`（台本は同名 `.txt` を隣に）／効果音 → `assets/audio/sfx/`
     - 映像 mp4/mov → `assets/video/`／フォント woff2/ttf/otf → `assets/fonts/`
  3. `node scripts/scan-assets.mjs` を実行して一覧を更新
  4. コミットして push し、付与した id をユーザーに伝える

## 進め方（ラウンド制）
1. `briefs/` の brief と、使う素材 id を確認する
2. **シーン1だけ**作る
3. **静止画3枚**をこのチャットで見せて止まる
4. 監督のチェックが通ってから次のシーンへ。修正は1点ずつ、数値（秒・フレーム・HEX・px）で反映する
- 新しい動画の入口は **brief と素材 id**。ユーザーが「この brief とこの素材で」と言えば作り始める。
- 参考動画がリンクだけで渡された場合は再現を試みず、スクリーンショットと視覚要素の言語化を求める。

## 書き出し
- 完成品は `out/<作品名>.mp4`（git 管理外）。書き出し後は ffprobe で尺・サイズ・音声トラックを確認して報告する。
- Remotion がブラウザをダウンロードできない環境では、`REMOTION_BROWSER_EXECUTABLE` に既存の Chrome / Chromium のパスを渡す。
