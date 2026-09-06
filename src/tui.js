"use strict";
const readline = require("readline");
const { EventEmitter } = require("events");
const { spawn } = require("child_process");
const t = require("./theme");
const snake = require("./snake");

const WIDTH = 52;

const ITEMS = [
  { label: "portfolio", hint: "saksham.digital", url: "https://saksham.digital" },
  { label: "writing", hint: "blog.saksham.digital", url: "https://blog.saksham.digital" },
  { label: "github", hint: "@saksham10arora-dotcom", url: "https://github.com/saksham10arora-dotcom" },
  { label: "linkedin", hint: "in/saksham-arora10", url: "https://www.linkedin.com/in/saksham-arora10" },
  { label: "email", hint: "saksham10arora@gmail.com", url: "mailto:saksham10arora@gmail.com" },
];

/** Raw-mode keypresses as a plain 'key' event, so the game and the menu can
    share one stdin listener instead of fighting over it. */
function makeInput() {
  const em = new EventEmitter();
  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("keypress", (str, key) => {
    if (!key) return;
    if (key.ctrl && key.name === "c") return em.emit("quit");
    em.emit("key", key.name || str);
  });
  return em;
}

function openUrl(url) {
  const cmd = process.platform === "darwin" ? "open"
    : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  try {
    spawn(cmd, args, { stdio: "ignore", detached: true }).unref();
    return true;
  } catch {
    return false;
  }
}

const pad = (s, n) => (s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length));

function buildLines({ cursor, stats, note, static: isStatic }) {
  const L = [];
  L.push("  " + t.bright("data science") + t.dim(" · ") + t.bright("quant research"));
  L.push("  " + t.dim("IIT Madras BS + GGSIPU B.Tech, run in parallel"));
  L.push("");
  ITEMS.forEach((it, i) => {
    const on = !isStatic && i === cursor;
    const mark = on ? t.violet("▸ ") : "  ";
    const label = on ? t.white(pad(it.label, 11)) : t.soft(pad(it.label, 11));
    L.push("  " + mark + label + t.dim(it.hint));
  });
  L.push("");
  if (isStatic) {
    L.push("  " + t.dim("saksham.digital  ·  npx saksham-arora"));
    return L;
  }
  if (stats) {
    const bits = [];
    if (stats.repos != null) bits.push(`${stats.repos} repos`);
    if (stats.followers != null) bits.push(`${stats.followers} followers`);
    bits.push("live from github");
    L.push("  " + t.dim(bits.join(" · ")));
  } else {
    L.push("  " + t.dim(stats === undefined ? "fetching live data…" : "offline"));
  }
  L.push("");
  L.push("  " + t.dim("↑↓ move   ⏎ open   g  ???   q quit"));
  if (note) L.push("  " + t.green(note));
  else L.push("");
  return L;
}

async function run(stream) {
  const input = makeInput();
  let cursor = 0;
  let stats;
  let note = "";
  let prev = 0;
  let busy = false;

  const render = () => {
    const lines = buildLines({ cursor, stats, note });
    const out = (prev ? t.up(prev) : "") + lines.map((l) => t.clearLine + l).join("\n") + "\n";
    prev = lines.length;
    stream.write(out);
  };

  render();

  require("./github").fetchStats().then((s) => {
    stats = s;
    if (!busy) render();
  });

  return new Promise((resolve) => {
    const done = () => { input.removeAllListeners(); resolve(); };
    input.on("quit", done);
    input.on("key", async (name) => {
      if (busy) return;
      if (name === "q" || name === "escape") return done();
      if (name === "up" || name === "k") cursor = (cursor - 1 + ITEMS.length) % ITEMS.length;
      else if (name === "down" || name === "j") cursor = (cursor + 1) % ITEMS.length;
      else if (name === "return" || name === "space") {
        const it = ITEMS[cursor];
        note = openUrl(it.url) ? `opening ${it.url}` : `could not open a browser · ${it.url}`;
      } else if (name === "g") {
        busy = true;
        stream.write("\n");
        const score = await snake.play(stream, input);
        busy = false;
        prev = 0;
        note = score > 0 ? `nice. ${score} picked up.` : "";
        stream.write("\n");
      } else return;
      render();
    });
  });
}

module.exports = { run, ITEMS, buildLines, WIDTH };
