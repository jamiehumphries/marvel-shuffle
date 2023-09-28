import { scenarios, heroes } from "./cards.js?v=next-evolution";

const table = document.getElementById("tracker");
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody");

function renderTable() {
  appendHeaderRows(thead);
  appendBodyRows(tbody);
}

function appendHeaderRows(thead) {
  const firstRow = createRow();
  const secondRow = createRow();

  appendProgressCells(firstRow, secondRow);

  for (const set of scenarios) {
    for (let i = 0; i < set.children.length; i++) {
      const scenario = set.children[i];

      const { name: text, color } = scenario;
      const colbreak = i === 0;
      const header = true;

      const scenarioCell = createCell({
        text,
        color,
        colspan: 2,
        colbreak,
        header,
      });
      firstRow.appendChild(scenarioCell);

      const standardCell = createCell({
        text: "Standard",
        color,
        colbreak,
        header,
      });
      const expertCell = createCell({ text: "Expert", color, header });
      secondRow.appendChild(standardCell);
      secondRow.appendChild(expertCell);
    }
  }

  thead.appendChild(firstRow);
  thead.appendChild(secondRow);
}

function appendProgressCells(firstRow, secondRow) {
  const scenarioCount = scenarios.flatMap((set) => set.children).length;
  const heroCount = heroes.flatMap(
    (cardOrSet) => cardOrSet.children || [cardOrSet]
  ).length;

  const totalCombinations = scenarioCount * heroCount;

  // TODO: Load from database.
  const standardCleared = 47;
  const expertCleared = 18;

  const percentageCleared = (cleared) =>
    `${((cleared / totalCombinations) * 100).toFixed(2)}%`;

  const totalCleared = standardCleared + expertCleared;
  const totalPercentage = percentageCleared(totalCleared / 2);
  const content = document.createElement("div");

  const percentageDiv = document.createElement("div");
  percentageDiv.innerText = totalPercentage;
  content.appendChild(percentageDiv);

  const fractionDiv = document.createElement("div");
  fractionDiv.innerText = `(${totalCleared} / ${totalCombinations * 2})`;
  content.appendChild(fractionDiv);

  const progressTotalCell = createCell({
    contentDiv: content,
    colspan: 2,
    header: true,
  });
  firstRow.appendChild(progressTotalCell);

  const standardPercentage = percentageCleared(standardCleared);
  const progressStandardCell = createCell({
    text: standardPercentage,
    header: true,
  });
  secondRow.appendChild(progressStandardCell);

  const expertPercentage = percentageCleared(expertCleared);
  const progressExpertCell = createCell({
    text: expertPercentage,
    header: true,
  });
  secondRow.appendChild(progressExpertCell);
}

function appendBodyRows(tbody) {
  for (let i = 0; i < heroes.length; i++) {
    const cardOrSet = heroes[i];
    if (cardOrSet.children) {
      const setHeroes = cardOrSet.children;
      for (let j = 0; j < setHeroes.length; j++) {
        const hero = setHeroes[j];
        const rowbreak = j === 0;
        appendHeroRow(tbody, hero, { rowbreak });
      }
    } else {
      const hero = cardOrSet;
      const rowbreak = i === 1; // Special case for first wave after core set.
      appendHeroRow(tbody, hero, { rowbreak });
    }
  }
}

function appendHeroRow(tbody, hero, { rowbreak } = {}) {
  const row = createRow({ rowbreak });

  const { name: text, color } = hero;
  const heroCell = createCell({ text, color, colspan: 2, header: true });
  row.appendChild(heroCell);

  for (const set of scenarios) {
    for (let i = 0; i < set.children.length; i++) {
      const colbreak = i === 0;
      const standardCell = createCell({ colbreak });
      const expertCell = createCell();
      row.appendChild(standardCell);
      row.appendChild(expertCell);
    }
  }

  tbody.appendChild(row);
}

function createRow({ rowbreak = false } = {}) {
  const row = document.createElement("tr");
  if (rowbreak) {
    row.classList.add("row-break");
  }
  return row;
}

function createCell({
  contentDiv = null,
  text = null,
  color = null,
  colspan = 1,
  colbreak = false,
  header = false,
} = {}) {
  const tag = header ? "th" : "td";
  const cell = document.createElement(tag);

  if (colspan != 1) {
    cell.setAttribute("colspan", colspan);
  }

  if (colbreak) {
    cell.classList.add("col-break");
  }

  const div = contentDiv || document.createElement("div");

  if (text) {
    div.innerText = text;
  }

  if (color) {
    div.style.backgroundColor = color;
    div.style.color = chooseTextColor(color);
  }

  cell.appendChild(div);

  return cell;
}

function chooseTextColor(backgroundColorHex) {
  // See: https://stackoverflow.com/a/3943023/1213714
  const { r, g, b } = hexToRgb(backgroundColorHex);
  return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#ffffff";
}

function hexToRgb(hex) {
  var result = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

renderTable();
