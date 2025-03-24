import { heroes } from "../data/cards.js?v=2121f86f";
import { getNumberOfIncompleteGames } from "../data/tracker.js?v=8c47738d";
import { filter } from "../helpers.js?v=01996c74";
import { Section } from "./Section.js?v=973f83f6";

export class HeroSection extends Section {
  constructor(settings, nthOfType) {
    super(settings, heroes, nthOfType);
  }

  initializeSectionRelationships() {
    this.childSection = this.aspectSections.find(
      (section) => section.nthOfType === this.nthOfType,
    );
    this.siblingSections.push(...filter(this.heroSections, [this]));
  }

  getPriorityFromTracking(hero) {
    const scenario = this.scenarioSection.trueCard;
    return this.settings.avoidCompleted && scenario !== null
      ? getNumberOfIncompleteGames([scenario], [hero])
      : 1;
  }
}
