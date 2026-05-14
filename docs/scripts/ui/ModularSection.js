import { extraModulars, modulars } from "../data/cards.js";
import { Modular } from "../models/Modular.js";
import { Section } from "./Section.js";

export class ModularSection extends Section {
  constructor(settings) {
    super(settings, modulars, 1, extraModulars);
  }

  get defaultCards() {
    return this.trueCards?.length > 0 && this.trueCards[0].isScheme
      ? super.defaultCards.concat(this.trueCards[0].schemeDefaultModulars)
      : super.defaultCards;
  }

  get placeholder() {
    return (this._placeholder ||= new Modular(`No ${this.sectionNamePlural}`));
  }

  chooseCards(isShuffleAll) {
    const { schemes } = this.scenarioSection.trueCard;
    this.incomingCards = super.chooseCards(isShuffleAll, 0, schemes.length);
    return this.incomingCards.concat(
      super.chooseCards(isShuffleAll, schemes.length),
    );
  }

  getRandomCount() {
    if (this.minCount == this.maxCount) {
      return this.minCount;
    }
    const maxOptionSets = this.getCardOptionSets(this.maxCount);
    return maxOptionSets.every((set) => set.length === 1)
      ? this.maxCount
      : super.getRandomCount();
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

  getCardOptionSets(count, isShuffleAll = false) {
    const scenario = this.scenarioSection.trueCard;
    const schemeOptionSets = scenario.schemes.map((stage, i) => {
      const filteredSchemes = stage.filter((card) => card.checked);
      return filteredSchemes.length > 0
        ? filteredSchemes
        : scenario.defaultSchemes[i];
    });
    return schemeOptionSets.concat(
      super.getCardOptionSets(count - schemeOptionSets.length, isShuffleAll),
    );
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
