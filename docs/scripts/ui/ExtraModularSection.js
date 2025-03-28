import { modulars } from "../data/cards.js?v=99e2ed8e";
import { Section } from "./Section.js?v=5574e168";

export class ExtraModularSection extends Section {
  constructor(settings) {
    super(settings, modulars, 2);
  }

  get sectionName() {
    return (this._sectionName ||= modifyName(super.sectionName));
  }

  get sectionNamePlural() {
    return (this._sectionNamePlural ||= modifyName(super.sectionNamePlural));
  }

  get maxSlots() {
    return this.settings.maxNumberOfExtraModulars;
  }

  get expectedCardCount() {
    return this.settings.numberOfExtraModulars;
  }

  initializeSectionRelationships() {
    this.siblingSections.push(this.modularSection);
  }

  getCardOptionTiers() {
    return this.modularSection
      .getCardOptionTiers()
      .filter((tier) => !tier.isRequired);
  }

  updateVisibility() {
    const visible = this.settings.numberOfExtraModulars > 0;
    this.toggleVisibility(visible);
  }
}

function modifyName(name) {
  return `Extra ${name}`;
}
