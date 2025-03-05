import { modulars } from "../data/cards.js?v=2121f86f";
import { Section } from "./Section.js?v=973f83f6";

export class ExtraModularSection extends Section {
  constructor(settings, previousSiblingSection) {
    super(settings, modulars, 2, { previousSiblingSection });
  }

  get modularSection() {
    return (this._modularSection ||= this.allSiblingSections[0]);
  }

  get sectionName() {
    return (this._sectionName ||= modifyName(super.sectionName));
  }

  get sectionNamePlural() {
    return (this._sectionNamePlural ||= modifyName(super.sectionNamePlural));
  }

  get maxSlots() {
    return 3;
  }

  get expectedCardCount() {
    return 3;
  }

  getCardOptionTiers() {
    return this.modularSection.getCardOptionTiers();
  }

  shuffle(options) {
    if (this.expectedCardCount === 0) {
      return;
    }
    super.shuffle(options);
  }
}

function modifyName(name) {
  return `Extra ${name}`;
}
