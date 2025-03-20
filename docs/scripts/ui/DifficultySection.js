import { difficulties } from "../data/cards.js?v=2121f86f";
import { getItem } from "../data/storage.js?v=62f5cba1";
import { EXPERT, STANDARD } from "../models/Difficulty.js?v=00000000";
import { Section } from "./Section.js?v=973f83f6";

export class DifficultySection extends Section {
  constructor(settings) {
    super(settings, difficulties, 1);
  }

  get maxSlots() {
    return 2;
  }

  get standardCardOptions() {
    return this.getCardOptionsForDifficultyLevel(STANDARD);
  }

  get expertCardOptions() {
    return this.getCardOptionsForDifficultyLevel(EXPERT);
  }

  get valid() {
    switch (this.cards.length) {
      case 1:
        return (
          this.includeExpertProbability < 1 &&
          this.standardCardOptions.includes(this.cards[0])
        );
      case 2:
        return (
          this.includeExpertProbability > 0 &&
          this.expertCardOptions.includes(this.cards[0]) &&
          this.standardCardOptions.includes(this.cards[1])
        );
      default:
        return false;
    }
  }

  get includeExpertProbability() {
    if (this.settings.alwaysIncludeExpert) {
      return 1;
    }
    const checkedExpertCards = this.checkedCards.filter(
      (card) => card.level === EXPERT,
    );
    return 1 - 1 / (checkedExpertCards.length + 1);
  }

  initializeOptions() {
    if (getItem(this.id) === null) {
      this.standardCardOptions[0].checked = true;
      this.expertCardOptions[0].checked = true;
    }
  }

  chooseCards(isShuffleAll) {
    const cards = [this.randomCard(this.standardCardOptions, isShuffleAll)];
    const includeExpert = Math.random() < this.includeExpertProbability;
    if (includeExpert) {
      cards.unshift(this.randomCard(this.expertCardOptions, isShuffleAll));
    }
    return cards;
  }

  getCardOptionsForDifficultyLevel(level) {
    const checked = this.checkedCards.filter((card) => card.level === level);
    return checked.length > 0
      ? checked
      : [this.selectableCards.find((card) => card.level === level)];
  }
}
