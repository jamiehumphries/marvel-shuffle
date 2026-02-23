import {
  heroes as allHeroes,
  scenarios as allScenarios,
} from "./data/cards.js?v=bf259637";
import { initializeStorage } from "./data/storage.js?v=5a17bb47";
import { Setting } from "./models/Setting.js?v=5c87f618";
import { flatten } from "./shared/helpers.js?v=f466f5fb";
import { renderTable } from "./shared/tracker.js?v=3b9595f9";

await initializeStorage();

const onlyShowSelectedSetting = new Setting("only-show-selected", "");

const scenarios = getGroups(allScenarios);
const heroes = getGroups(allHeroes);

const table = renderTable(scenarios, heroes);
setUpIntersectionObserver();

const scrollBuffer = 8;
const fixedHeight = table
  .querySelector("thead tr:last-of-type th")
  .getBoundingClientRect().bottom;
const fixedWidth = table
  .querySelector("tbody tr th:last-of-type")
  .getBoundingClientRect().right;

window.addEventListener("focusin", (event) => {
  ensureFocusedCellVisible(event);
});

function getGroups(cardsOrSets) {
  const allGroups = cardsOrSets.reduce((groups, cardOrSet, i) => {
    const isSet = !!cardOrSet.children;
    const isNewGroup = isSet || i === 1; // Special case for Wave 1 heroes.
    if (isNewGroup) {
      groups.push([]);
    }

    const group = groups[groups.length - 1];
    group.push(...flatten(cardOrSet));

    return groups;
  }, []);

  if (!onlyShowSelectedSetting.checked) {
    return allGroups;
  }

  const filteredGroups = allGroups
    .map((group) => group.filter((card) => card.checked))
    .filter((group) => group.length > 0);

  return filteredGroups.length > 0 ? filteredGroups : [flatten(cardsOrSets[0])];
}

function setUpIntersectionObserver() {
  const cells = [...document.querySelectorAll("td")];
  const firstCell = cells.shift();
  const rootMargin = getComputedStyle(firstCell).width;
  const observer = new IntersectionObserver(updateVisibility, { rootMargin });

  // Ensure first tab stop available.
  makeVisible(firstCell);

  for (const cell of cells) {
    observer.observe(cell);
  }
}

function updateVisibility(entries, observer) {
  for (const entry of entries) {
    if (!entry.isIntersecting) {
      continue;
    }
    const cell = entry.target;
    makeVisible(cell);
    observer.unobserve(cell);
  }
}

function makeVisible(cell) {
  cell.classList.add("visible");
}

function ensureFocusedCellVisible(event) {
  if (event.target.tagName !== "INPUT") {
    return;
  }

  const div = event.target.closest("td").querySelector("div");
  const { top, right, bottom, left } = div.getBoundingClientRect();
  const { clientHeight, clientWidth } = document.documentElement;

  if (top < fixedHeight + scrollBuffer) {
    window.scrollBy({ top: top - fixedHeight - scrollBuffer });
  } else if (bottom + scrollBuffer > clientHeight) {
    window.scrollBy({ top: bottom - clientHeight + scrollBuffer });
  }

  if (left < fixedWidth + scrollBuffer) {
    window.scrollBy({ left: left - fixedWidth - scrollBuffer });
  } else if (right + scrollBuffer > clientWidth) {
    window.scrollBy({ left: right - clientHeight + scrollBuffer });
  }
}
