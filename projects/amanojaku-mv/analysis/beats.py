"""曲の拍位置を推定して src/data/beats.json に書き出す。
使い方：python3 analysis/beats.py <曲ファイル>
依存：numpy, ffmpeg
- 区間ごとの一定テンポ格子を作り、各拍を ±60ms 以内のアタック最大点に寄せる
- strength はその拍のアタックの強さ（0〜1、カットの候補選びに使う）
"""
import json, subprocess, sys
import numpy as np

SR = 22050
HOP = 256
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32)
n = 1024
fr = SR / HOP
frames = np.lib.stride_tricks.sliding_window_view(x, n)[::HOP] * np.hanning(n)
S = np.abs(np.fft.rfft(frames, axis=1))
L = np.log1p(10 * S)
o = np.r_[0, np.maximum(0, np.diff(L, axis=0)).sum(1)]
o = np.maximum(o - np.convolve(o, np.ones(32) / 32, "same"), 0)
# 高域（ハイハット）と中域（ブラス）のアタック
f = np.fft.rfftfreq(n, 1 / SR)
def band_onset(a, b):
    m = (f >= a) & (f < b)
    v = np.r_[0, np.maximum(0, np.diff(L[:, m], axis=0)).sum(1)]
    return np.maximum(v - np.convolve(v, np.ones(32) / 32, "same"), 0)
o_hat = band_onset(6000, 11000)
o_brass = band_onset(400, 2500)

def score(bpm, t0, t1):
    p = 60 / bpm * fr
    best = (0, 0)
    for ph in np.linspace(0, p, 64, endpoint=False):
        idx = (t0 * fr + ph + np.arange(0, (t1 - t0) * fr, p)).astype(int)
        s = o[idx].mean()
        if s > best[0]:
            best = (s, (t0 * fr + ph) / fr)
    return best

# 区間ごとにテンポと位相を推定（Bridge 前後でずれるため）
segments = [(16.0, 97.0), (97.0, 116.0), (116.0, len(x) / SR - 1)]
grids = []
for a, b in segments:
    res = max(((score(bpm, a, b), bpm) for bpm in np.arange(138.5, 142.5, 0.02)), key=lambda r: r[0][0])
    grids.append({"fromSec": a, "toSec": b, "bpm": round(float(res[1]), 3), "phaseSec": round(float(res[0][1]), 4)})

beats = []
win = int(0.06 * fr)
for g in grids:
    period = 60 / g["bpm"]
    t = g["phaseSec"]
    while t < g["toSec"]:
        if t >= g["fromSec"] and (not beats or t - beats[-1]["t"] > period * 0.5):
            i = int(t * fr)
            lo, hi = max(0, i - win), min(len(o), i + win + 1)
            j = lo + int(np.argmax(o[lo:hi]))
            beats.append({"t": round(j / fr, 4), "strength": float(o[j]), "hat": float(o_hat[lo:hi].max()), "brass": float(o_brass[lo:hi].max())})
        t += period

for k in ("strength", "hat", "brass"):
    m = max(b[k] for b in beats) or 1
    for b in beats:
        b[k] = round(b[k] / m, 3)

json.dump({"grids": grids, "beats": beats}, open(sys.argv[2] if len(sys.argv) > 2 else "src/data/beats.json", "w"), indent=1)
print(grids, len(beats))
