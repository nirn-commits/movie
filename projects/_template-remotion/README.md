# Remotion テンプレート

雛形は**手写しせず、公式スキャフォールドを使って**作成してください。

## 手順
リポジトリのルートで実行します。

```bash
# 1. 公式スキャフォールドで作成
npx create-video@latest --yes --blank projects/<作品名>
cd projects/<作品名>

# 2. Remotion スキルを追加
npx remotion skills add

# 3. Studio でプレビュー
npm run dev

# 4. 書き出し
npx remotion render <CompositionId> ../../out/<作品名>.mp4
```

## 書き方の約束
- 動きは `useCurrentFrame()` + `interpolate()` で書く
- テキスト・色・数字は Composition の props（defaultProps）に分離する
- 素材はプロジェクト内 `public/` に置き、`staticFile()` で参照する
