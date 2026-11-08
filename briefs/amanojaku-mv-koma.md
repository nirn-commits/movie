# BRIEF：あまのじゃくじゃく MV（コマ割り版）

既存版（`projects/amanojaku-mv/`）とは別作品として、形式から作り直したもの。

## 成果物
| 項目 | 値 |
|---|---|
| エンジン | Remotion（`projects/amanojaku-mv-koma/`、Composition `AmanojakuKoma`） |
| サイズ / fps / 長さ | 1920×1080 / 30fps / 191.664 秒（曲の全尺） |
| 書き出し | `out/amanojaku-mv-koma.mp4` |
| 歌詞 | `briefs/amanojaku-mv.lyrics.md`（正） |

## 形式
- 画面全体をマンガの1ページとして扱う。枠は黒8px、コマ間は白26px、紙の余白40px
- 割りの基本形：全面1コマ／左右分割／横3段／斜め割り／不規則な多分割（派生：正方形等分・縦割り）
- 歌詞は 吹き出し（表＝白地黒字、裏＝黒地白字・素材の左右反転）／ナレーション枠／対義語の漢字 のどれかで出す
- 対義語：右×左、彼(あっち)×此(こっち)×何(どっち)×其(そっち)、好×嫌、多(もっと)×少(ちょっと)、因(だって)×何(なんで)、表×裏、泣×笑、勝×負
- 色：#F7F2EC / #141114 / #DE2E5A。書体：Zen Kaku Gothic New Black のみ

## コマ破り（4回のみ）
1. 49.6s「あまのじゃくじゃく」：01 の伸ばした手が斜めの枠を越える
2. 63.9s「……本気にした？」：全コマが消え、中央に 06 の小さな1コマ
3. 157.6s「そんな私を見抜いてよ！」：04 を枠なし全面
4. Outro：09 が小さな最後の1コマに閉じ込められ、最後の和音で裏返って白紙 → タイトル1.5秒

## 素材番号 → 素材 id（`src/config.ts` の `cast`）
| 番号 | id | 備考 |
|---|---|---|
| 元絵（全身しーっ） | `chara-fullbody-arms-crossed-cutout` | **未受領のため 05 で代役** |
| 01 | `chara-reach-grin-cutout` | |
| 02 | `chara-sing-shout-cutout` | |
| 03 | `chara-back-sitting` | |
| 04 | `chara-smile-tear-cutout` | |
| 05 | `chara-fullbody-arms-crossed-cutout` | |
| 06 | `chara-surprised-hands-cutout` | |
| 07 | `chara-point-angry-cutout` | |
| 08 | `bg-stage-curtain` | |
| 09 | `chara-shh-smile-cutout` | |
| 10（しーっ黒） | `chara-shh-smile-cutout` | **未受領のため 09 を黒地に置いて代役** |

## 時間の扱い（推定・要確認）
- 歌詞の時刻は音声認識の単語位置から推定
- Outro：「今の、なし。」は 164.92s に出すが、コマが裏返って白紙になるのは最後のピアノ和音（189.0s）。164.92s 以降は約24秒の後奏があるため、その間は 09 の小さなコマがゆっくり縮む
