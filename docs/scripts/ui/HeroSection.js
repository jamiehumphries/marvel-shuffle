import { heroes } from "../data/cards.js?v=2121f86f";
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
    // TODO
    return 1;
  }

  updateVisibility() {
    const visible = this.nthOfType <= this.settings.numberOfHeroes;
    this.toggleVisibility(visible);
  }
}
