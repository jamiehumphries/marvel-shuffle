import {
  heroes as allHeroes,
  scenarios as allScenarios,
} from "./data/cards.js?v=feb74a7e";
import { initializeStorage } from "./data/storage.js?v=5a17bb47";
import { Setting } from "./models/Setting.js?v=c527045e";
import { flatten } from "./shared/helpers.js?v=f466f5fb";
import { renderTable } from "./shared/tracker.js?v=186620e4";

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
