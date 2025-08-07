import { heroes } from "../data/cards.js?v=93d9f49b";
import { getNumberOfIncompleteGames } from "../data/tracker.js?v=a778c31b";
import { filter } from "../helpers.js?v=7cb83087";
import { Section } from "./Section.js?v=f09d9cd9";

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
