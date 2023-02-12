import { aspects, heroes, scenarios, modules } from "./scripts/cards.js";

import { statSync } from "fs";
import sizeOf from "image-size";

let currentType = null;

const columns = [];

console.log("");
for (const cardOrSet of [...scenarios, ...modules, ...heroes, ...aspects]) {
  const cards = cardOrSet.children || [cardOrSet];
  for (const { frontSrc, backSrc } of cards) {
    const [_, type, name] = frontSrc.match(/images\/([a-z]+)\/([a-z-]+)/);
    if (type !== currentType) {
      currentType = type;
      columns.push([
        { color: "\x1b[0m", text: `=== ${type.toUpperCase()} ===` },
      ]);
    }

    const column = columns[columns.length - 1];
    if (statSync(frontSrc).size === 0 || statSync(backSrc).size === 0) {
      column.push({ color: "\x1b[31m", text: `✗ ${name}` });
    } else if (correctSize(frontSrc) && correctSize(backSrc)) {
      column.push({ color: "\x1b[32m", text: `✓ ${name}` });
    } else {
      column.push({ color: "\x1b[33m", text: `✗ ${name}` });
    }
  }
}

const rows = Math.max(...columns.map((column) => column.length));
for (let i = 0; i < rows; i++) {
  for (const column of columns) {
    const { color, text } = column[i] || { color: "\x1b[0m", text: "" };
    process.stdout.write(`${color}${text.padEnd(30)}\x1b[0m`);
  }
  process.stdout.write("\n");
}

function correctSize(src) {
  const dimensions = sizeOf(src);
  return dimensions.width === 294 && dimensions.height === 418;
}
