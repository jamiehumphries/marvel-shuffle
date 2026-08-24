import { extraModulars, modulars } from "../data/cards.js?v=915600ae";
import { Modular } from "../models/Modular.js?v=ad4bb6f6";
import { filter } from "../shared/helpers.js?v=2ecd4db0";
import { Section } from "./Section.js?v=40080b77";

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
    const specialCardOptionSets = this.getSpecialCardOptionSets();
    return specialCardOptionSets.concat(
      super.getCardOptionSets(
        count - specialCardOptionSets.length,
        isShuffleAll,
      ),
    );
  }

  getSpecialCardOptionSets() {
    const scenario = this.scenarioSection.trueCard;

    const pinnedForScenario = this.scenarioSection.getPinnedModulars(scenario);
    if (pinnedForScenario) {
      return pinnedForScenario.map((card) => [card]);
    }

    const allPinned = this.scenarioSection.getAllPinnedModulars();
    return scenario.specialModularOptionSets.map(
      ({ options, defaultOption }) => {
        options = filter(options, allPinned);
        const checkedOptions = options.filter((card) => card.checked);
        if (checkedOptions.length > 0) {
          return checkedOptions;
        }
        return defaultOption ? [defaultOption] : options;
      },
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
