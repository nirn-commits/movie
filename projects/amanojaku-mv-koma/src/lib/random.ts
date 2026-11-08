/** シード付き擬似乱数（Math.random は使わない）。同じシードなら必ず同じ値 */
export const rand = (seed: number) => {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** a〜b の範囲の擬似乱数 */
export const randRange = (seed: number, a: number, b: number) => a + (b - a) * rand(seed);
