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

  get valid() {
    if (this.settings.alwaysIncludeExpert && this.cards.length !== 2) {
      return false;
    }

    const validStandardCards = this.getStandardOptions();
    const validExpertCards = this.getExpertOptions().filter((card) => !!card);

    switch (this.cards.length) {
      case 1:
        return validStandardCards.includes(this.cards[0]);
      case 2:
        return (
          validExpertCards.includes(this.cards[0]) &&
          validStandardCards.includes(this.cards[1])
        );
      default:
        return false;
    }
  }

  initializeOptions() {
    if (getItem(this.id) === null) {
      this.standardCards[0].checked = true;
    }
  }

  chooseCards() {
    const standardOptions = this.getStandardOptions();
    const expertOptions = this.getExpertOptions();
    return [expertOptions, standardOptions]
      .map((options) => Section.chooseRandom(options))
      .filter((card) => !!card);
  }

  getStandardOptions() {
    const standardOptions = this.standardCards.filter((card) => card.checked);
    if (standardOptions.length === 0) {
      standardOptions.push(this.standardCards[0]);
    }
    return standardOptions;
  }

  getExpertOptions() {
    const expertOptions = this.expertCards.filter((card) => card.checked);
    if (!this.settings.alwaysIncludeExpert) {
      expertOptions.push(null);
    } else if (expertOptions.length === 0) {
      expertOptions.push(this.expertCards[0]);
    }
    return expertOptions;
  }
}
