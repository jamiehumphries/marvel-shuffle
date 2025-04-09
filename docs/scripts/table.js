import {
  heroes as allHeroes,
  scenarios as allScenarios,
} from "./data/cards.js";
import { initializeStorage } from "./data/storage.js";
import { renderTable } from "./data/tracker.js";
import { Setting } from "./models/Setting.js";

await initializeStorage();

const onlyShowSelectedSetting = new Setting("only-show-selected", "");

const scenarios = getGroups(allScenarios);
const heroes = getGroups(allHeroes);

renderTable(scenarios, heroes);

function getGroups(cardsOrSets) {
  const allGroups = cardsOrSets.reduce((groups, cardOrSet, i) => {
    const isSet = !!cardOrSet.children;

    const isNewGroup = isSet || i === 1; // Special case for Wave 1 heroes.
    if (isNewGroup) {
      groups.push([]);
    }

    const group = groups[groups.length - 1];
    if (isSet) {
      group.push(...cardOrSet.children);
    } else {
      group.push(cardOrSet);
    }

    return groups;
  }, []);

  if (!onlyShowSelectedSetting.checked) {
    return allGroups;
  }

  const filteredGroups = allGroups
    .map((group) => group.filter((card) => card.checked))
    .filter((group) => group.length > 0);

  return filteredGroups.length > 0 ? filteredGroups : [cardsOrSets[0].children];
}
