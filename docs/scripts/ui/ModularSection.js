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
