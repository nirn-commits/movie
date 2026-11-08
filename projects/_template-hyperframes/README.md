# HyperFrames テンプレート

## 始め方
新しい作品は**このフォルダをコピーして**始めてください。

```bash
cp -r projects/_template-hyperframes projects/<作品名>
cd projects/<作品名>
```

## プレビューと書き出し
```bash
npx hyperframes preview
npx hyperframes render --output ../../out/<作品名>.mp4
```

## 構成について
- ファイル構成・コンポジションの書き方の**正は `hyperframes-core` スキル**です。このREADMEと食い違う場合はスキルに従ってください。
- 動きは `paused` で seek 可能な単一の GSAP タイムラインで書きます。
- テキスト・色・BPM などは CONFIG に分離します。
