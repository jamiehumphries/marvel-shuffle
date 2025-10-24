import { modulars } from "../data/cards.js?v=cbf2d4b6";
import { Section } from "./Section.js?v=95c0d851";

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

  get excludedCards() {
    const scenario = this.scenarioSection.trueCard;
    return super.excludedCards.concat(scenario.hardExcludedChildCards);
  }

  get placeholder() {
    return (this._placeholder ||= new this.type(
      `No ${this.sectionNamePlural}`,
    ));
  }

  get maxSlots() {
    return this.settings.maxAllowedExtraModulars;
  }

  get minCount() {
    return this.settings.minExtraModulars;
  }

  get maxCount() {
    return this.settings.maxExtraModulars;
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
    const visible = this.settings.maxExtraModulars > 0;
    this.toggleVisibility(visible);
  }
}

function modifyName(name) {
  return `Extra ${name}`;
}
