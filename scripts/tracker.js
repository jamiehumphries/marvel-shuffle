import { scenarios, heroes } from "./cards.js?v=next-evolution";
import {
  initializeStorage,
  getItem,
  setItem,
} from "./storage.js?v=next-evolution";

const table = document.getElementById("tracker");
const thead = table.querySelector("thead");
const tbody = table.querySelector("tbody");

let totalPercentageDiv;
let totalFractionDiv;
let standardPercentageDiv;
let expertPercentageDiv;

function renderTable() {
  appendHeaderRows(thead);
  appendBodyRows(tbody);
  setUpIndeterminateCheckboxes();
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
  const contentDiv = document.createElement("div");

  totalPercentageDiv = document.createElement("div");
  contentDiv.appendChild(totalPercentageDiv);

  totalFractionDiv = document.createElement("div");
  contentDiv.appendChild(totalFractionDiv);

  const progressTotalCell = createCell({
    contentDiv,
    colspan: 2,
    header: true,
  });
  firstRow.appendChild(progressTotalCell);

  standardPercentageDiv = document.createElement("div");
  const progressStandardCell = createCell({
    contentDiv: standardPercentageDiv,
    header: true,
  });
  secondRow.appendChild(progressStandardCell);

  expertPercentageDiv = document.createElement("div");
  const progressExpertCell = createCell({
    contentDiv: expertPercentageDiv,
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
      const scenario = set.children[i];
      const colbreak = i === 0;
      const standardCell = createGameCell(scenario, hero, "standard", {
        colbreak,
      });
      const expertCell = createGameCell(scenario, hero, "expert");
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

function createGameCell(scenario, hero, difficulty, options = {}) {
  const gameId = `game--${scenario.id}--${hero.id}--${difficulty}`;

  const contentDiv = document.createElement("div");
  const label = document.createElement("label");
  label.htmlFor = gameId;
  contentDiv.appendChild(label);

  options.contentDiv = contentDiv;
  const cell = createCell(options);

  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = gameId;
  input.indeterminate = true;
  input.dataset.difficulty = difficulty;

  cell.prepend(input);
  return cell;
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

function setUpIndeterminateCheckboxes() {
  const checkboxes = document.getElementsByTagName("input");
  for (const checkbox of checkboxes) {
    const state = getItem(checkbox.id);
    applyStateToCheckbox(checkbox, state);
    checkbox.addEventListener("click", handleCheckboxClick);
  }
}

function handleCheckboxClick(event) {
  const checkbox = event.target;
  const newState = nextCheckboxState(checkbox.dataset.state);
  setItem(checkbox.id, newState);
  applyStateToCheckbox(checkbox, newState);
  updateProgress();
}

function nextCheckboxState(state) {
  const states = ["?", "✓", "✗"];
  return states[(states.indexOf(state) + 1) % states.length];
}

function applyStateToCheckbox(checkbox, state) {
  state ||= "?";
  checkbox.dataset.state = state;
  checkbox.indeterminate = state === "?";
  checkbox.checked = state === "✓";
}

function updateProgress() {
  const totalCombinations = document.querySelectorAll("input").length;
  const toPercentage = (decimal) => `${(decimal * 100).toFixed(2)}%`;

  const standardCleared = document.querySelectorAll(
    'input:checked[data-difficulty="standard"]'
  ).length;
  const expertCleared = document.querySelectorAll(
    'input:checked[data-difficulty="expert"]'
  ).length;
  const totalCleared = standardCleared + expertCleared;

  const totalPercentage = toPercentage(totalCleared / totalCombinations);
  const standardPercentage = toPercentage(
    standardCleared / (totalCombinations / 2)
  );
  const expertPercentage = toPercentage(
    expertCleared / (totalCombinations / 2)
  );

  totalPercentageDiv.innerText = totalPercentage;
  totalFractionDiv.innerText = `(${totalCleared} / ${totalCombinations})`;
  standardPercentageDiv.innerText = standardPercentage;
  expertPercentageDiv.innerText = expertPercentage;
}

await initializeStorage();
renderTable();
updateProgress();
