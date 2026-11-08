# Remotion テンプレート

雛形は手写しせず、**公式スキャフォールド**に、このフォルダの2ファイルを重ねて使います。

## 新しい作品の始め方（Claude Code が実行）
```bash
npx create-video@latest --yes --blank projects/<作品名>
cp -r projects/_template-remotion/src/lib projects/<作品名>/src/
cp projects/_template-remotion/remotion.config.ts projects/<作品名>/
cd projects/<作品名>
# tsconfig.json の compilerOptions に "resolveJsonModule": true を追加
npm run dev                                                     # Studio でプレビュー
npx remotion still <CompositionId> ../../out/<作品名>-f30.png --frame=30   # 確認用の静止画
npx remotion render <CompositionId> ../../out/<作品名>.mp4      # 書き出し
```

## 中身
| ファイル | 役割 |
|---|---|
| `src/lib/assets.ts` | `assets/manifest.json` を読み、`getAsset / getImage / getAudio / getVideo(id)` で素材を引く |
| `remotion.config.ts` | `Config.setPublicDir("../../assets")` で共通素材を public として扱う。`REMOTION_BROWSER_EXECUTABLE` でブラウザ指定可 |

## 書き方の約束
- 動きは `useCurrentFrame()` + `interpolate()`
- テキスト・色・数字・素材 id は CONFIG（= defaultProps）へ
- 素材は `getImage("hero-eye").src` のように id で引く。パスを直書きしない

実際に動く例は `projects/_sample-assets-test/` です。
