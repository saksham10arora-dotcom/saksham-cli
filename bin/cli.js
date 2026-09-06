#!/usr/bin/env node
"use strict";
const t = require("../src/theme");
const font = require("../src/font");
const intro = require("../src/intro");
const tui = require("../src/tui");
const pkg = require("../package.json");

const argv = process.argv.slice(2);
const has = (...f) => f.some((x) => argv.includes(x));

if (has("-h", "--help")) {
  console.log(`
  ${pkg.name} v${pkg.version}

  npx saksham-arora            interactive card
    --no-anim                  skip the intro
    --no-color                 plain text
    -v, --version              version
    -h, --help                 this

  Piping or redirecting output prints a static card instead.
`);
  process.exit(0);
}
if (has("-v", "--version")) { console.log(pkg.version); process.exit(0); }

const out = process.stdout;

function wordmark() {
  const top = font.word("SAKSHAM");
  const bottom = font.word("ARORA");
  // centre the shorter line under the longer one, as the intro does
  const gap = " ".repeat(Math.floor((top[0].length - bottom[0].length) / 2));
  const paint = (r, lead) =>
    "  " + lead + t.violet(r.replace(/#/g, "█").replace(/\./g, " "));
  return [...top.map((r) => paint(r, "")), ...bottom.map((r) => paint(r, gap))];
}

/* Not a terminal (piped, redirected, CI): print once and leave. Nothing is
   interactive and no escape codes are emitted, so `npx saksham-arora > card.txt`
   produces something readable. */
if (!out.isTTY) {
  t.setEnabled(false);
  console.log("\n" + wordmark().join("\n") + "\n");
  console.log(tui.buildLines({ cursor: -1, stats: null, note: "", static: true }).join("\n"));
  process.exit(0);
}

const restore = () => { out.write(t.SHOW); try { process.stdin.setRawMode(false); } catch {} };
process.on("exit", restore);
process.on("SIGINT", () => { restore(); process.exit(0); });

(async () => {
  out.write(t.HIDE + "\n");
  const narrow = (out.columns || 80) < 46;
  if (!has("--no-anim") && !narrow) {
    const state = { skip: false };
    const skip = () => { state.skip = true; };
    process.stdin.on("data", skip);
    try { process.stdin.setRawMode(true); } catch {}
    process.stdin.resume();
    await intro.play(out, state);
    process.stdin.off("data", skip);
  } else {
    out.write(wordmark().join("\n") + "\n");
  }
  out.write("\n");
  await tui.run(out);
  restore();
  out.write("\n");
  process.exit(0);
})();
