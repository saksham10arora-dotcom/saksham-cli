"use strict";
/* 5x5 block letters. Only the glyphs the wordmark needs are defined; the
   renderer throws on anything else so a typo shows up immediately rather
   than silently printing a gap. */
const G = {
  S: ["#####", "#....", "#####", "....#", "#####"],
  A: ["#####", "#...#", "#####", "#...#", "#...#"],
  K: ["#...#", "#..#.", "###..", "#..#.", "#...#"],
  H: ["#...#", "#...#", "#####", "#...#", "#...#"],
  M: ["#...#", "##.##", "#.#.#", "#...#", "#...#"],
  R: ["#####", "#...#", "#####", "##...", "#..##"],
  O: ["#####", "#...#", "#...#", "#...#", "#####"],
  " ": [".....", ".....", ".....", ".....", "....."],
};

const HEIGHT = 5;

/** Returns 5 strings of '#' and '.', one per row, for the given word. */
function word(text) {
  const rows = ["", "", "", "", ""];
  const chars = text.toUpperCase().split("");
  chars.forEach((ch, i) => {
    const g = G[ch];
    if (!g) throw new Error(`no glyph for ${JSON.stringify(ch)}`);
    for (let r = 0; r < HEIGHT; r++) rows[r] += g[r] + (i < chars.length - 1 ? "." : "");
  });
  return rows;
}

module.exports = { word, HEIGHT };
