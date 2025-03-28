import { modulars } from "../data/cards.js?v=9a2e587a";
import { Section } from "./Section.js?v=cee48f1c";

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
