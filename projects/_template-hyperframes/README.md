# HyperFrames テンプレート

## 新しい作品の始め方（Claude Code が実行）
```bash
cd projects
npx hyperframes init <作品名> --skip-skills --non-interactive
cd <作品名>
npx hyperframes preview      # プレビュー
npx hyperframes snapshot     # 確認用の静止画
npx hyperframes render       # 書き出し → ../../out/<作品名>.mp4 に移動
```

## 決まりごと
- 構成・書き方の**正は `hyperframes` スキル**（と `hyperframes-cli`）です。このREADMEと食い違う場合はスキルに従います。
- 動きは `paused` で seek 可能な単一の GSAP タイムラインで書きます。
- テキスト・色・BPM・素材 id は冒頭の CONFIG にまとめます。

## 素材の読み込み
- `staticFile()` は使いません。HTML から見た**相対パス**で読みます。
- パスは直書きせず、`../../assets/manifest.json` を読んで **id → path** を引きます。
  projects/<作品名>/index.html からは `"../../" + entry.path` が実ファイルです。
