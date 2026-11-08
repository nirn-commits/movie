# claude-video-workspace

Claude Code に**コードで動画を作らせる**ためのワークスペースです。監督（あなた）が brief を書き、Claude Code が HyperFrames または Remotion で実装します。

## 前提
- Node.js 22 以上
- FFmpeg
- Claude Code

## 始め方
```bash
bash scripts/setup.sh
```
前提チェックの後、HyperFrames と Remotion の公式スキルが入ります（スキル本体はリポジトリに含めません）。使えるスキルは [docs/skills.md](docs/skills.md) を参照してください。

## 新しい動画の作り方
1. **brief を書く**：`cp briefs/BRIEF.template.md briefs/<作品名>.md` で作成し、記入する
2. **渡す**：Claude Code に「`briefs/<作品名>.md` を読んでシーン1を作って」と依頼する
3. **静止画で確認**：Claude Code がシーン1の静止画を3枚出して止まるので確認する
4. **1点ずつ数値で直す**：「タイトルの登場を 12f 遅らせる」「アクセント色を `#FF5A36` に」のように指示する
5. **out/ に書き出す**：全シーンが通ったら `out/<作品名>.mp4` にレンダリングする

最初の1本の候補は [examples/README.md](examples/README.md) にあります。

## 置き場所

| 場所 | 置くもの |
|---|---|
| `briefs/` | 作品ごとの仕様書（brief） |
| `projects/<作品名>/` | 作品のコード（テンプレートは `_template-*`） |
| `assets/images/` `audio/` `fonts/` `video/` | 共通素材（外部素材はここに凍結） |
| `out/` | 書き出した動画（git 管理外） |
| `scripts/` | セットアップ用スクリプト |
| `docs/` | スキル集などの資料 |
| `examples/` | 最初の1本の候補 |

## ルール要約
- 動画はコードで描く。実写は動画生成モデルを別工程として提案する
- 動きはフレーム／時刻の関数のみ（CSS transition・`Date.now()`・`Math.random()` 禁止）
- テキスト・色・数字・BPM・速度は CONFIG / props に分離する
- 外部素材は `assets/` か `public/` に凍結してから使う
- ラウンド制：シーン1 → 静止画3枚 → チェック → 次へ
- 参考動画はリンクだけでなく、スクリーンショットと言語化を添えて渡す

詳細は [CLAUDE.md](CLAUDE.md) を参照してください。
