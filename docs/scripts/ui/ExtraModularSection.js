import { modulars } from "../data/cards.js?v=2121f86f";
import { Section } from "./Section.js?v=973f83f6";

export const MAX_NUMBER_OF_EXTRA_MODULARS = 4;

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
    return MAX_NUMBER_OF_EXTRA_MODULARS;
  }

  get expectedCardCount() {
    return this.settings.numberOfExtraModulars;
  }

  initializeSectionRelationships() {
    this.siblingSections.push(this.modularSection);
  }

  getCardOptionTiers() {
    return this.modularSection.getCardOptionTiers();
  }
}

function modifyName(name) {
  return `Extra ${name}`;
}
