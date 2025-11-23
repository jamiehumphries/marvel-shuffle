import { extraModulars, modulars } from "../data/cards.js?v=1a835479";
import { Modular } from "../models/Modular.js?v=ce788f0d";
import { Section } from "./Section.js?v=b7129e26";

export class ModularSection extends Section {
  constructor(settings) {
    super(settings, modulars, 1, extraModulars);
  }

  get placeholder() {
    return (this._placeholder ||= new Modular(`No ${this.sectionNamePlural}`));
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
    const schemeOptionSets = scenario.schemes.map((schemes) => {
      const filteredSchemes = schemes.filter((card) => card.checked);
      return filteredSchemes.length > 0 ? filteredSchemes : [schemes[0]];
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
