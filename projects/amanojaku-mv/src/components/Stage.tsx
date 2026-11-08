import React from "react";
import { AbsoluteFill } from "remotion";
import { Shot, currentShot } from "../lib/shots";
import { Bg } from "./kit";
import { Needle } from "./Needle";

/**
 * 区間の土台：背景色 → 心の針 → ショットの中身、の順に重ねる。
 * 針は常にキャラの背後に来る。
 */
export const Stage: React.FC<{
  t: number;
  shots: Shot[];
  bg: Shot["bg"];
  needleOpacity?: number;
  needleScale?: number;
  overlay?: React.ReactNode;
}> = ({ t, shots, bg, needleOpacity = 0.14, needleScale = 1, overlay }) => {
  const { shot, local } = currentShot(t, shots);
  return (
    <AbsoluteFill>
      <Bg color={shot.bg ?? bg ?? "white"} />
      <Needle opacity={needleOpacity} scale={needleScale} />
      {shot.render(local)}
      {overlay}
    </AbsoluteFill>
  );
};
