#!/usr/bin/env bash
# Claude Code 動画ワークスペースのセットアップ
set -u

cd "$(dirname "$0")/.."

ok=1
echo "== 前提チェック =="

if command -v node >/dev/null 2>&1; then
  major="$(node -p 'process.versions.node.split(".")[0]')"
  if [ "$major" -ge 22 ]; then
    echo "[OK] Node $(node --version)"
  else
    echo "[NG] Node $(node --version)：22 以上が必要です"; ok=0
  fi
else
  echo "[NG] Node が見つかりません（22 以上をインストールしてください）"; ok=0
fi

if command -v ffmpeg >/dev/null 2>&1; then
  echo "[OK] $(ffmpeg -version | head -n1)"
else
  echo "[NG] FFmpeg が見つかりません"; ok=0
fi

if command -v claude >/dev/null 2>&1; then
  echo "[OK] Claude Code $(claude --version 2>/dev/null || true)"
else
  echo "[NG] Claude Code が見つかりません（npm i -g @anthropic-ai/claude-code）"; ok=0
fi

if [ "$ok" -ne 1 ]; then
  echo "前提が揃っていません。上記を解消してから再実行してください。"
  exit 1
fi

echo
echo "== 公式スキルのインストール（リポジトリには含めません） =="
npx -y skills add heygen-com/hyperframes --agent claude-code
npx skills add remotion-dev/skills

echo
echo "完了しました。docs/skills.md で使えるスキルを確認できます。"
