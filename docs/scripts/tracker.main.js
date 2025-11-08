import {
  heroes as allHeroes,
  scenarios as allScenarios,
} from "./data/cards.js";
import { initializeStorage } from "./data/storage.js";
import { Setting } from "./models/Setting.js";
import { flatten } from "./shared/helpers.js";
import { renderTable } from "./shared/tracker.js";

await initializeStorage();

const onlyShowSelectedSetting = new Setting("only-show-selected", "");

const scenarios = getGroups(allScenarios);
const heroes = getGroups(allHeroes);

renderTable(scenarios, heroes);
setUpIntersectionObserver();

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
  const cells = document.querySelectorAll("td");
  const observer = new IntersectionObserver(updateVisibility);
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
    cell.classList.add("show");
    observer.unobserve(cell);
  }
}
