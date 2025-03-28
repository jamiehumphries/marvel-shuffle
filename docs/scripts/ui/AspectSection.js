import { aspects } from "../data/cards.js?v=99e2ed8e";
import { Section } from "./Section.js?v=5574e168";

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
