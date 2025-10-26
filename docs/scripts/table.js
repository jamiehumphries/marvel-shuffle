import {
  heroes as allHeroes,
  scenarios as allScenarios,
} from "./data/cards.js?v=cbf2d4b6";
import { initializeStorage } from "./data/storage.js?v=5a17bb47";
import { renderTable } from "./data/tracker.js?v=cb025513";
import { flatten } from "./helpers.js?v=f466f5fb";
import { Setting } from "./models/Setting.js?v=c27de980";

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
