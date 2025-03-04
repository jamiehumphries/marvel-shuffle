import { Section } from "./Section.js?v=55c1680f";

export class ModularSection extends Section {
  get extraModularSection() {
    return this.allSiblingSections[0];
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
    if (!options.isInitialize) {
      this.extraModularSection?.shuffle(options);
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
