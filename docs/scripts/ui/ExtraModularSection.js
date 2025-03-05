import { modulars } from "../cards.js?v=4416f240";
import { Section } from "./Section.js?v=55c1680f";

export class ExtraModularSection extends Section {
  constructor(settings, previousSiblingSection) {
    super(settings, modulars, 2, { previousSiblingSection });
  }

  get modularSection() {
    return this.allSiblingSections[0];
  }

  get sectionName() {
    return this.modifyBaseName(super.sectionName);
  }

  get sectionNamePlural() {
    return this.modifyBaseName(super.sectionNamePlural);
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

  modifyBaseName(baseName) {
    return `Extra ${baseName}`;
  }
}
