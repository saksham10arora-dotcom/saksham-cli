"use strict";
/* ASCII rain condensing into the wordmark -- the same idea as the banner on
   the GitHub profile, so the two surfaces read as one brand. Skipped entirely
   on a narrow or non-TTY terminal, and any keypress cuts it short. */
const t = require("./theme");
const font = require("./font");

const GLYPHS = "01<>[]{}()/\\|=+-*#%$&@?!:;._^~";
const W = 41;
const ROWS = 11;
const L1_TOP = 0;
const L2_TOP = 6;
const FRAMES = 34;
const FRAME_MS = 40;

function buildMask() {
  const mask = new Map();
  const put = (rows, top) => {
    const off = Math.floor((W - rows[0].length) / 2);
    rows.forEach((line, r) => {
      [...line].forEach((ch, c) => {
        if (ch === "#") mask.set(`${top + r},${off + c}`, true);
      });
    });
  };
  put(font.word("SAKSHAM"), L1_TOP);
  put(font.word("ARORA"), L2_TOP);
  return mask;
}

function play(stream, state) {
  const mask = buildMask();
  const order = new Map();
  for (const k of mask.keys()) {
    const c = Number(k.split(",")[1]);
    order.set(k, Math.min(1, (c / W) * 0.75 + Math.random() * 0.3));
  }
  const period = ROWS + 10;
  const cols = Array.from({ length: W }, () => ({
    head: Math.random() * period,
    speed: 0.55 + Math.random() * 0.9,
    tail: 4 + Math.floor(Math.random() * 6),
  }));

  return new Promise((resolve) => {
    stream.write("\n".repeat(ROWS));
    let f = 0;
    const timer = setInterval(() => {
      if (state.skip || f >= FRAMES) {
        clearInterval(timer);
        draw(FRAMES - 1);
        return resolve();
      }
      draw(f++);
    }, FRAME_MS);

    function draw(frame) {
      const p = frame / FRAMES;
      const reveal = p < 0.34 ? 0 : Math.min(1, (p - 0.34) / 0.34);
      const lines = [];
      for (let r = 0; r < ROWS; r++) {
        let line = "";
        for (let c = 0; c < W; c++) {
          const key = `${r},${c}`;
          if (mask.has(key) && reveal >= order.get(key)) {
            line += t.white("█");
            continue;
          }
          // Rain thins out over the last fifth so the animation settles on a
          // clean wordmark -- this frame stays on screen above the card.
          const alive = p < 0.70 ? 1 : Math.max(0, 1 - (p - 0.70) / 0.18);
          const col = cols[c];
          const head = (col.head + col.speed * frame) % period;
          const dist = (head - r + period) % period;
          if (dist < col.tail && ((c * 7 + r * 13) % 100) < alive * 100) {
            const g = GLYPHS[(c * 7 + r * 13 + frame) % GLYPHS.length];
            const near = dist / col.tail;
            line += near < 0.25 ? t.bright(g) : near < 0.6 ? t.violet(g) : t.dim(g);
          } else line += " ";
        }
        lines.push(line);
      }
      stream.write(t.up(ROWS) + lines.map((l) => t.clearLine + l).join("\n") + "\n");
    }
  });
}

module.exports = { play, WIDTH: W, ROWS };
