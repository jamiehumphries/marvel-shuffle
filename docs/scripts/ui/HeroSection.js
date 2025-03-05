import { heroes } from "../data/cards.js?v=2121f86f";
import { getNumberOfIncompleteGames } from "../data/tracker.js?v=8c47738d";
import { Section } from "./Section.js?v=973f83f6";

export class HeroSection extends Section {
  constructor(settings, previousSiblingSection, scenarioSection, nthOfType) {
    super(settings, heroes, nthOfType, { previousSiblingSection });
    this.scenarioSection = scenarioSection;
    scenarioSection.heroSections.push(this);
  }

  getPriorityFromTracking(hero) {
    const scenario = this.scenarioSection.trueCard;
    return this.settings.avoidCompleted && scenario !== null
      ? getNumberOfIncompleteGames([scenario], [hero])
      : 1;
  }
}
