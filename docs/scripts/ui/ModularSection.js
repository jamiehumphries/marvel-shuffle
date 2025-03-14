import { extraModulars, modulars } from "../data/cards.js?v=2121f86f";
import { Section } from "./Section.js?v=973f83f6";

export class ModularSection extends Section {
  constructor(settings, parentSection) {
    const extraCards = extraModulars;
    super(settings, modulars, 1, { extraCards, parentSection });
  }

  get extraModularSection() {
    return (this._extraModularSection ||= this.allSiblingSections[0]);
  }

  get valid() {
    if (!super.valid) {
      return false;
    }

    return this.uncountedCards.every((card) => {
      if (this.requiredCards.includes(card)) {
        return true;
      }

      switch (this.settings.getProbability(card)) {
        case 0:
          return !this.cards.includes(card);
        case 1:
          return this.cards.includes(card);
        default:
          return true;
      }
    });
  }

  setCards(value) {
    super.setCards(value);
    this.updateRequiredLabels();
  }

  shuffleIfInvalid(options = {}) {
    const shuffled = super.shuffleIfInvalid(options);
    if (!shuffled) {
      this.updateRequiredLabels();
    }
    return shuffled;
  }

  shuffle(options = {}) {
    super.shuffle(options);
    if (this.extraModularSection.isInitialized) {
      this.extraModularSection.shuffle(options);
    }
  }

  chooseCards(isShuffleAll) {
    const cards = super.chooseCards(isShuffleAll);

    for (const card of this.uncountedCards) {
      if (cards.includes(card)) {
        continue;
      }

      const cardProbabilty = this.settings.getProbability(card);
      if (Math.random() < cardProbabilty) {
        cards.push(card);
      }
    }

    return cards;
  }

  updateRequiredLabels() {
    const required = this.parentCard.requiredChildCards;
    const slots = this.slots || [];
    for (const slot of slots) {
      const { root, card } = slot;
      const isRequired = required.includes(card);
      root.classList.toggle("is-required", isRequired);
    }
  }
}
