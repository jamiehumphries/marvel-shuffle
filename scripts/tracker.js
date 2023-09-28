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

  const progressTotalCell = createCell({ colspan: 2, header: true });
  firstRow.appendChild(progressTotalCell);

  const progressStandardCell = createCell({ header: true });
  const progressExpertCell = createCell({ header: true });
  secondRow.appendChild(progressStandardCell);
  secondRow.appendChild(progressExpertCell);

  for (const set of scenarios) {
    for (let i = 0; i < set.children.length; i++) {
      const scenario = set.children[i];
      const colbreak = i === 0;
      const header = true;

      const scenarioCell = createCell({
        text: scenario.name,
        colspan: 2,
        colbreak,
        header,
      });
      firstRow.appendChild(scenarioCell);

      const standardCell = createCell({ text: "Standard", colbreak, header });
      const expertCell = createCell({ text: "Expert", header });
      secondRow.appendChild(standardCell);
      secondRow.appendChild(expertCell);
    }
  }

  thead.appendChild(firstRow);
  thead.appendChild(secondRow);
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

  const heroCell = createCell({ text: hero.name, colspan: 2, header: true });
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
  text = "",
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

  const div = document.createElement("div");
  div.innerText = text;
  cell.appendChild(div);

  return cell;
}

renderTable();
