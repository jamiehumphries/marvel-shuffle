import { EXPERT, STANDARD } from "../models/Difficulty.js";
import { difficulties as allDifficulties } from "./cards.js";
import { getItem, setItem } from "./storage.js";

const WIN = "✓";
const LOSS = "✗";
const UNPLAYED = "?";

const table = document.getElementById("tracker");

let totalPercentageSpan;
let totalFractionSpan;

export function renderTable(scenarios, heroes, difficulties = []) {
  if (difficulties.length === 0) {
    difficulties = getTrackedDifficulties();
  }

  document.body.style.setProperty(
    "--number-of-difficulties",
    difficulties.length,
  );

  clearTable();

  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  appendHeaderRows(thead, scenarios, difficulties);
  appendBodyRows(tbody, scenarios, heroes, difficulties);
  setUpIndeterminateCheckboxes(tbody);

  const fragment = document.createDocumentFragment();
  fragment.appendChild(thead);
  fragment.appendChild(tbody);

  table.appendChild(fragment);

  updateProgress();
}

function clearTable() {
  table.removeEventListener("click", handleCheckboxClick);
  table.innerHTML = "";
}

function getTrackedDifficulties() {
  const checked = allDifficulties.filter((difficulty) => difficulty.checked);
  if (checked.length > 0) {
    return checked;
  }
  const standard = allDifficulties.find(
    (difficulty) => difficulty.level === STANDARD,
  );
  const expert = allDifficulties.find(
    (difficulty) => difficulty.level === EXPERT,
  );
  return [standard, expert];
}

function appendHeaderRows(thead, scenarios, difficulties) {
  const firstRow = createRow();
  const secondRow = createRow();

  appendProgressCells(firstRow, secondRow, difficulties);

  for (const group of scenarios) {
    for (let i = 0; i < group.length; i++) {
      const scenario = group[i];

      const { name: text, color, hasI } = scenario;
      const colbreak = i === 0;
      const header = true;

      const scenarioCell = createCell({
        text,
        color,
        colspan: difficulties.length,
        colbreak,
        header,
        hasI,
      });
      firstRow.appendChild(scenarioCell);

      for (let j = 0; j < difficulties.length; j++) {
        const { name } = difficulties[j];
        const cell = createCell({
          text: name,
          colbreak: colbreak && j == 0,
          blockEnd: j === difficulties.length - 1,
          color,
          header,
          difficulty: true,
        });
        secondRow.appendChild(cell);
      }
    }
  }

  thead.appendChild(firstRow);
  thead.appendChild(secondRow);
}

function appendProgressCells(firstRow, secondRow, difficulties) {
  const contentDiv = document.createElement("div");

  const progressDiv = (span, id = null) => {
    const div = document.createElement("div");
    div.class = "progress-cell";
    div.appendChild(span);
    if (id !== null) {
      div.id = id;
    }
    return div;
  };

  totalPercentageSpan = document.createElement("span");
  contentDiv.appendChild(progressDiv(totalPercentageSpan, "total-percentage"));

  totalFractionSpan = document.createElement("span");
  contentDiv.appendChild(progressDiv(totalFractionSpan, "total-fraction"));

  const progressTotalCell = createCell({
    contentDiv,
    colspan: difficulties.length,
    header: true,
    progress: true,
  });
  firstRow.appendChild(progressTotalCell);

  for (let i = 0; i < difficulties.length; i++) {
    const difficulty = difficulties[i];

    difficulty.span = document.createElement("span");
    const cell = createCell({
      contentDiv: progressDiv(difficulty.span),
      header: true,
      blockIndex: i,
      blockEnd: i === difficulties.length - 1,
      progress: true,
      difficulty: true,
    });

    secondRow.appendChild(cell);
  }
}

function appendBodyRows(tbody, scenarios, heroes, difficulties) {
  for (const group of heroes) {
    for (let i = 0; i < group.length; i++) {
      const hero = group[i];
      const rowbreak = i === 0;
      appendHeroRow(tbody, scenarios, hero, difficulties, { rowbreak });
    }
  }
}

function appendHeroRow(
  tbody,
  scenarios,
  hero,
  difficulties,
  { rowbreak } = {},
) {
  const row = createRow({ rowbreak });

  const { name: text, subname, color, hasI } = hero;
  const heroCell = createCell({
    text,
    subname,
    color,
    colspan: difficulties.length,
    header: true,
    hasI,
  });
  row.appendChild(heroCell);

  for (const group of scenarios) {
    for (let i = 0; i < group.length; i++) {
      const scenario = group[i];
      const colbreak = i === 0;
      for (let j = 0; j < difficulties.length; j++) {
        const difficulty = difficulties[j];
        const cell = createGameCell(scenario, hero, difficulty, {
          colbreak: colbreak && j === 0,
          blockEnd: j === difficulties.length - 1,
        });
        row.appendChild(cell);
      }
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
  const gameId = getGameId(scenario, hero, difficulty);

  const contentDiv = document.createElement("div");
  const label = document.createElement("label");
  label.htmlFor = gameId;
  label.classList.add("icon");
  contentDiv.appendChild(label);

  options.contentDiv = contentDiv;
  const cell = createCell(options);

  const input = document.createElement("input");
  input.type = "checkbox";
  input.id = gameId;
  input.indeterminate = true;
  input.dataset.difficulty = difficulty.id;

  cell.prepend(input);
  return cell;
}

function createCell({
  contentDiv = null,
  text = null,
  subname = null,
  hasI = false,
  color = null,
  colspan = 1,
  colbreak = false,
  header = false,
  progress = false,
  difficulty = false,
  blockEnd = false,
  blockIndex = null,
} = {}) {
  const tag = header ? "th" : "td";
  const cell = document.createElement(tag);
  const div = contentDiv || document.createElement("div");
  cell.appendChild(div);

  const classMap = {
    "block-end": blockEnd,
    "col-break": colbreak,
    "has-i": hasI || difficulty,
    progress,
    difficulty,
  };

  Object.entries(classMap).map(([className, toggle]) => {
    cell.classList.toggle(className, toggle);
  });

  if (colspan != 1) {
    cell.setAttribute("colspan", colspan);
  }

  if (progress && blockIndex) {
    cell.style.setProperty("--progress-col", blockIndex);
  }

  if (text) {
    const textDiv = document.createElement("div");
    textDiv.innerText = text;
    div.appendChild(textDiv);

    if (subname) {
      const subnameDiv = document.createElement("div");
      subnameDiv.innerText = subname;
      subnameDiv.classList.add("subname");
      div.appendChild(subnameDiv);
    }
  }

  if (color) {
    div.style.backgroundColor = color;
    div.style.color = chooseTextColor(color);
  }

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

function setUpIndeterminateCheckboxes(tbody) {
  const checkboxes = tbody.getElementsByTagName("input");
  for (const checkbox of checkboxes) {
    const state = getItem(checkbox.id);
    applyStateToCheckbox(checkbox, state);
  }

  table.addEventListener("click", handleCheckboxClick);
}

function handleCheckboxClick(event) {
  if (event.target.type !== "checkbox") {
    return;
  }
  const checkbox = event.target;
  const newState = nextCheckboxState(checkbox.dataset.state);
  setItem(checkbox.id, newState);
  applyStateToCheckbox(checkbox, newState);
  updateProgress();
}

function nextCheckboxState(state) {
  const states = [UNPLAYED, WIN, LOSS];
  return states[(states.indexOf(state) + 1) % states.length];
}

function applyStateToCheckbox(checkbox, state) {
  state ||= UNPLAYED;
  checkbox.dataset.state = state;
  checkbox.indeterminate = state === UNPLAYED;
  checkbox.checked = state === WIN;
}

function updateProgress() {
  const difficulties = allDifficulties.filter(({ span }) => !!span);

  const totalCombinations = table.querySelectorAll("input").length;
  const toPercentage = (decimal) => `${(decimal * 100).toFixed(2)}%`;

  let totalCleared = 0;

  const combinationsPerDifficulty = totalCombinations / difficulties.length;
  for (const { id, name, span } of difficulties) {
    const cleared = table.querySelectorAll(
      `input:checked[data-difficulty="${id}"]`,
    ).length;
    totalCleared += cleared;
    if (difficulties.length > 1) {
      const percentage = toPercentage(cleared / combinationsPerDifficulty);
      span.innerText = percentage;
    } else {
      span.innerText = name;
    }
  }

  const totalPercentage = toPercentage(totalCleared / totalCombinations);
  totalPercentageSpan.innerText = totalPercentage;
  totalFractionSpan.innerText = `${totalCleared} / ${totalCombinations}`;
}

export function getNumberOfIncompleteGames(scenarios, heroes, difficulties) {
  if (difficulties.length === 0) {
    difficulties = getTrackedDifficulties();
  }

  let incompleteCount = 0;
  for (const scenario of scenarios) {
    for (const hero of heroes) {
      for (const difficulty of difficulties) {
        if (!isGameCompleted(scenario, hero, difficulty)) {
          incompleteCount++;
        }
      }
    }
  }

  return incompleteCount;
}

function isGameCompleted(scenario, hero, difficulty) {
  const gameId = getGameId(scenario, hero, difficulty);
  return getItem(gameId) === WIN;
}

function getGameId(scenario, hero, difficulty) {
  return `game--${scenario.id}--${hero.id}--${difficulty.id}`;
}
