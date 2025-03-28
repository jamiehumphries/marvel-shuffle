import { heroes } from "../data/cards.js?v=99e2ed8e";
import { getNumberOfIncompleteGames } from "../data/tracker.js?v=568d61c2";
import { filter } from "../helpers.js?v=01996c74";
import { Section } from "./Section.js?v=5574e168";

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

  getPriorityFromTracking(hero, isShuffleAll) {
    const scenarios = this.scenarioSection.trueCards;
    const difficulties = isShuffleAll
      ? this.difficultySection.checkedCards
      : this.difficultySection.trueCards;
    return getNumberOfIncompleteGames(scenarios, [hero], difficulties);
  }

  updateVisibility() {
    const visible = this.nthOfType <= this.settings.numberOfHeroes;
    this.toggleVisibility(visible);
  }
}
