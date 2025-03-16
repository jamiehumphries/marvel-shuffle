import { difficulties } from "../data/cards.js?v=2121f86f";
import { getItem } from "../data/storage.js?v=62f5cba1";
import { Section } from "./Section.js?v=973f83f6";

export class DifficultySection extends Section {
  constructor(settings) {
    super(settings, difficulties, 1);
    this.standardCards = [];
    this.expertCards = [];
    for (const card of difficulties) {
      const cardGroup = card.isStandard ? this.standardCards : this.expertCards;
      cardGroup.push(card);
    }
  }

  get maxSlots() {
    return 2;
  }

  initializeOptions() {
    if (getItem(this.id) === null) {
      this.standardCards[0].checked = true;
    }
  }

  getCardOptionSets() {
    const standardOptions = this.standardCards.filter((card) => card.checked);
    const expertOptions = this.expertCards.filter((card) => card.checked);

    if (standardOptions.length === 0) {
      standardOptions.push(this.standardCards[0]);
    }

    if (!this.settings.alwaysIncludeExpert) {
      expertOptions.push(undefined);
    } else if (expertOptions.length === 0) {
      expertOptions.push(this.expertCards[0]);
    }

    return [standardOptions, expertOptions];
  }
}
