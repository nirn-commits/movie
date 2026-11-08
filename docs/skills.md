# 使えるスキル集

`bash scripts/setup.sh` で入る公式スキルです（`.claude/skills/` に入り、リポジトリには含めません）。
2026-11 時点で実際に入った構成をもとにしています。

## HyperFrames 公式（heygen-com/hyperframes・9個）

| スキル | 向いていること |
|---|---|
| `hyperframes` | **入口**。HyperFrames で作る・直す・書き出す全般。描画の約束と作業ループ |
| `hyperframes-cli` | init / check / snapshot / preview / render など CLI 操作 |
| `hyperframes-registry` | 約450個の既製ブロック（トランジション、キネティックタイポ、字幕、チャート、地図など） |
| `media-use` | 音楽・効果音・画像・ナレーション・文字起こし・切り抜き・色調整など素材の入手と加工 |
| `figma` | Figma のデザインやトークンを動画に取り込む |
| `slideshow` | 発表用のスライドショー（プレゼンターモード付き） |
| `style-sampling` | 実績のある解説動画スタイルで新しい回を作る |
| `reverse-any-video` | 手元の動画ファイルを編集可能な HyperFrames プロジェクトとして組み直す |
| `remotion-to-hyperframes` | Remotion などの既存コードを HyperFrames に移植し、フレーム単位で照合する |

## Remotion 公式（remotion-dev/skills・13個）

| スキル | 向いていること |
|---|---|
| `remotion-best-practices` | **入口**。各 Remotion スキルへの振り分け |
| `remotion-create` | 新しい Remotion 動画の作成 |
| `remotion-markup` | 内容・アニメーション・エフェクトの書き方 |
| `remotion-studio` | Studio でのプレビュー |
| `remotion-render` | 書き出し |
| `remotion-captions` | 文字起こしと字幕の表示・アニメーション |
| `remotion-maps` | 地図アニメーション |
| `remotion-multimedia` | Mediabunny による音声・映像ファイルの扱い |
| `remotion-interactivity` | 操作できる構造にするためのマークアップ |
| `remotion-docs` | Remotion ドキュメント検索 |
| `remotion-upgrade` | Remotion 関連パッケージの更新 |
| `remotion-saas` | Remotion を使ったアプリ開発 |
| `remotion-license` | ライセンス情報 |

## 用途別の早見

| やりたいこと | 使うもの |
|---|---|
| キネティックタイポ・タイトル | `hyperframes` + `hyperframes-registry` |
| 曲に合わせたリリック | `hyperframes` + `media-use` |
| 数字・グラフのデータ動画 | Remotion（`remotion-best-practices` → `remotion-markup`） |
| 字幕の焼き込み | `remotion-captions` または `hyperframes-registry` の字幕ブロック |
