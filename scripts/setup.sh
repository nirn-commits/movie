#!/usr/bin/env bash
# Claude Code 動画ワークスペースのセットアップ
set -u
cd "$(dirname "$0")/.."

ok=1
echo "== 前提チェック =="
if command -v node >/dev/null 2>&1 && [ "$(node -p 'process.versions.node.split(".")[0]')" -ge 22 ]; then
  echo "[OK] Node $(node --version)"
else
  echo "[NG] Node 22 以上が必要です（現在：$(node --version 2>/dev/null || echo 未インストール)）"; ok=0
fi
for t in ffmpeg ffprobe; do
  if command -v "$t" >/dev/null 2>&1; then echo "[OK] $t"; else echo "[NG] $t が見つかりません"; ok=0; fi
done
if command -v git-lfs >/dev/null 2>&1 || git lfs version >/dev/null 2>&1; then
  git lfs install --local >/dev/null && echo "[OK] Git LFS"
else
  echo "[注意] Git LFS が見つかりません（大きい音声・映像素材の管理に使います）"
fi
[ "$ok" -eq 1 ] || { echo "前提が揃っていません。"; exit 1; }

echo
echo "== 公式スキルの追加（リポジトリには含めません） =="
npx -y skills add heygen-com/hyperframes --agent claude-code
npx skills add remotion-dev/skills

echo
echo "== 素材一覧の更新 =="
node scripts/scan-assets.mjs
echo "完了しました。"
