import { extraModulars, modulars } from "../data/cards.js";
import { Section } from "./Section.js";

export class ModularSection extends Section {
  constructor(settings) {
    super(settings, modulars, 1, extraModulars);
  }

  get placeholder() {
    return (this._placeholder ||= new this.type(
      `No ${this.sectionNamePlural}`,
    ));
  }

  get valid() {
    if (!super.valid) {
      return false;
    }

    return this.uncountedCards
      .filter((card) => !this.requiredCards.includes(card))
      .every((card) => {
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
    const slots = this.slots || [];
    for (const slot of slots) {
      const { root, requiredReason, card } = slot;
      const isRequired = this.requiredCards.includes(card);
      root.classList.toggle("is-required", isRequired);
      requiredReason.innerText = card?.requiredReason
        ? ` ${card.requiredReason}`
        : "";
    }
  }
}
