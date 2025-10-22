import { heroes } from "../data/cards.js?v=56b026d6";
import { getNumberOfIncompleteGames } from "../data/tracker.js?v=01128521";
import { filter } from "../helpers.js?v=85ee0a71";
import { Section } from "./Section.js?v=97576c58";

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

  getPriority(hero, isShuffleAll) {
    if (!this.settings.avoidCompleted) {
      return 1;
    }

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
