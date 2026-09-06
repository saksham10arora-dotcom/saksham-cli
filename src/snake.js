"use strict";
/* The thing behind `g`. Colour distinguishes snake from food, but so does the
   glyph, so it still plays under NO_COLOR. */
const t = require("./theme");

const CW = 20, CH = 12, TICK = 110;

function play(stream, input) {
  return new Promise((resolve) => {
    let snake = [{ x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }];
    let dir = { x: 1, y: 0 };
    let next = dir;
    let food = place();
    let score = 0, dead = false, timer = null;

    function place() {
      let p;
      do {
        p = { x: Math.floor(Math.random() * CW), y: Math.floor(Math.random() * CH) };
      } while (snake.some((s) => s.x === p.x && s.y === p.y));
      return p;
    }

    const onKey = (name) => {
      if (name === "q" || name === "escape") return finish();
      if ((name === "up" || name === "w") && dir.y === 0) next = { x: 0, y: -1 };
      else if ((name === "down" || name === "s") && dir.y === 0) next = { x: 0, y: 1 };
      else if ((name === "left" || name === "a") && dir.x === 0) next = { x: -1, y: 0 };
      else if ((name === "right" || name === "d") && dir.x === 0) next = { x: 1, y: 0 };
    };
    input.on("key", onKey);

    function finish() {
      if (timer) clearInterval(timer);
      input.off("key", onKey);
      resolve(score);
    }

    function step() {
      dir = next;
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
      if (head.x < 0 || head.y < 0 || head.x >= CW || head.y >= CH ||
          snake.some((s) => s.x === head.x && s.y === head.y)) {
        dead = true;
        draw();
        setTimeout(finish, 900);
        if (timer) clearInterval(timer);
        return;
      }
      snake.unshift(head);
      if (head.x === food.x && head.y === food.y) { score += 1; food = place(); }
      else snake.pop();
      draw();
    }

    function draw() {
      const out = [];
      out.push(t.dim("  ╭" + "─".repeat(CW * 2) + "╮"));
      for (let y = 0; y < CH; y++) {
        let row = "";
        for (let x = 0; x < CW; x++) {
          if (snake[0].x === x && snake[0].y === y) row += t.white("██");
          else if (snake.some((s) => s.x === x && s.y === y)) row += t.violet("██");
          else if (food.x === x && food.y === y) row += t.amber("▒▒");
          else row += "  ";
        }
        out.push(t.dim("  │") + row + t.dim("│"));
      }
      out.push(t.dim("  ╰" + "─".repeat(CW * 2) + "╯"));
      out.push("  " + (dead
        ? t.amber(`caught yourself. score ${score}`)
        : t.dim(`score ${score}   ↑↓←→ move   q back`)));
      stream.write(t.up(CH + 3) + out.map((l) => t.clearLine + l).join("\n") + "\n");
    }

    stream.write("\n".repeat(CH + 3));
    draw();
    timer = setInterval(step, TICK);
  });
}

module.exports = { play, HEIGHT: CH + 3 };
