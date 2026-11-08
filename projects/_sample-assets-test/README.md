# _sample-assets-test

素材が **id 経由で読み込める**ことを実証する 3 秒の Remotion サンプルです。

- 画像 `sample-test-image`（`assets/images/sample-test-image.png`）
- 音声 `sample-test-tone`（`assets/audio/sfx/sample-test-tone.wav`、440Hz サイン波 3 秒）

```bash
npm install
npx remotion render SampleAssetsTest ../../out/sample-assets-test.mp4
```

検証結果：1280×720 / 30fps / 3.008 秒、H.264 映像＋AAC 48kHz ステレオ音声。
