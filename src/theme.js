"use strict";
/* Colour is opt-out: NO_COLOR, a --no-color flag, or a non-TTY stdout all
   fall back to plain text, so piping the card into a file stays readable. */
let on = process.stdout.isTTY && !process.env.NO_COLOR && !process.argv.includes("--no-color");

const rgb = (r, g, b) => (s) => (on ? `\x1b[38;2;${r};${g};${b}m${s}\x1b[0m` : String(s));

module.exports = {
  setEnabled(v) { on = v; },
  get enabled() { return on; },
  violet: rgb(170, 66, 255),
  soft: rgb(140, 110, 210),
  dim: rgb(104, 92, 138),
  bright: rgb(239, 233, 255),
  white: rgb(255, 255, 255),
  green: rgb(80, 220, 140),
  amber: rgb(240, 180, 90),
  bold: (s) => (on ? `\x1b[1m${s}\x1b[0m` : String(s)),
  HIDE: "\x1b[?25l",
  SHOW: "\x1b[?25h",
  up: (n) => `\x1b[${n}A`,
  clearLine: "\x1b[2K",
};
