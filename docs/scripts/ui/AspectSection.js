import { aspects } from "../data/cards.js?v=9a2e587a";
import { Section } from "./Section.js?v=cee48f1c";

export class AspectSection extends Section {
  constructor(settings, nthOfType) {
    super(settings, aspects, nthOfType);
  }

  initializeSectionRelationships() {
    this.childSection = this.modularSection;
  }

  updateVisibility() {
    const visible = this.nthOfType <= this.settings.numberOfHeroes;
    this.toggleVisibility(visible);
  }
}
