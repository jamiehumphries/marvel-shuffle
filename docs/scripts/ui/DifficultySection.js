import { difficulties } from "../data/cards.js?v=bf259637";
import { getItem, setItem } from "../data/storage.js?v=5a17bb47";
import { EXPERT, STANDARD } from "../models/Difficulty.js?v=6cb27704";
import { getNumberOfIncompleteGames } from "../shared/tracker.js?v=3b9595f9";
import { Section } from "./Section.js?v=904f2b22";

export class DifficultySection extends Section {
  constructor(settings) {
    super(settings, difficulties, 1);
    this.heroicLevelSettingId = this.id + "--setting--heroic-level";
  }

  get maxSlots() {
    return 2;
  }

  get minCount() {
    return this.includeExpertProbability === 1 ? 2 : 1;
  }

  get maxCount() {
    return this.includeExpertProbability === 0 ? 1 : 2;
  }

  get standardCardOptions() {
    return this.getCardOptions(STANDARD);
  }

  get expertCardOptions() {
    return this.getCardOptions(EXPERT);
  }

  get valid() {
    return super.valid && this.heroicLevel <= this.settings.maxHeroicLevel;
  }

  get includeExpertProbability() {
    if (this.settings.alwaysIncludeExpert) {
      return 1;
    }

    const checkedStandardCards = this.getCheckedCards(STANDARD);
    const checkedExpertCards = this.getCheckedCards(EXPERT);

    if (checkedStandardCards.length > 0 && checkedExpertCards.length === 0) {
      return 0;
    }

    return 1 - 1 / (this.expertCardOptions.length + 1);
  }

  get heroicLevel() {
    return this._heroicLevel || 0;
  }

  set heroicLevel(value) {
    this.setHeroicLevel(value);
  }

  initializeLayout() {
    super.initializeLayout();

    const heroicLevelTemplate = document.getElementById("heroic-level");
    const element = heroicLevelTemplate.content.cloneNode(true);
    this.root.appendChild(element);
    this.heroicLevelValue = this.root.querySelector(".heroic-level-value");

    this.heroicLevelCards = [];
    const cardsContainer = this.root.querySelector(".heroic-level-cards");
    for (let i = 0; i < this.settings.maxAllowedHeroicLevel; i++) {
      const img = document.createElement("img");
      img.src = this.type.placeholderImageSrc;
      cardsContainer.appendChild(img);
      this.heroicLevelCards.push(img);
    }
  }

  initializeOptions() {
    const selectDifficulties = document.getElementById("select-difficulties");
    const h3 = this.root.querySelector("h3").cloneNode(true);
    h3.querySelector("button").disabled = true;
    selectDifficulties.prepend(h3);
    const optionsHint = this.buildOptionsHint();
    h3.insertAdjacentElement("afterend", optionsHint);

    if (getItem(this.id) === null) {
      this.standardCardOptions[0].checked = true;
    }
  }

  initializeCards() {
    this.heroicLevel = this.loadHeroicLevel();
    super.initializeCards();
  }

  shuffle({ animate = true, ...options } = {}) {
    super.shuffle({ animate, ...options });

    const maxHeroicLevel = this.settings.maxHeroicLevel;
    const newHeroicLevel = Math.floor(Math.random() * (maxHeroicLevel + 1));
    this.runWithShuffle(() => (this.heroicLevel = newHeroicLevel), animate);
  }

  getRandomCount() {
    switch (this.includeExpertProbability) {
      case 0:
        return 1;
      case 1:
        return 2;
      default:
        const includeExpertToAvoidCompleted = this.standardCardOptions.every(
          (card) => this.getPriority(card) === 0,
        );
        if (includeExpertToAvoidCompleted) {
          return 2;
        }
        return Math.random() < this.includeExpertProbability ? 2 : 1;
    }
  }

  getCardOptionSets(count) {
    return [this.standardCardOptions, this.expertCardOptions].slice(0, count);
  }

  getCheckedCards(level) {
    return this.checkedCards.filter((card) => card.level === level);
  }

  getCardOptions(level) {
    const checked = this.getCheckedCards(level);
    return checked.length > 0
      ? checked
      : [this.selectableCards.find((card) => card.level === level)];
  }

  getPriority(difficulty) {
    if (!this.settings.avoidCompleted) {
      return 1;
    }

    const scenarios = this.scenarioSection.trueCards;
    const heroes = this.heroSections.flatMap((section) => section.trueCards);
    return getNumberOfIncompleteGames(scenarios, heroes, [difficulty]);
  }

  setHeroicLevel(value) {
    this._heroicLevel = value;
    setItem(this.heroicLevelSettingId, value);
    this.root.classList.toggle("hide-heroic-level", value === 0);
    this.heroicLevelValue.innerText = value;
    for (let i = 0; i < this.settings.maxAllowedHeroicLevel; i++) {
      this.heroicLevelCards[i].classList.toggle("hidden", i >= value);
    }
  }

  loadHeroicLevel() {
    const savedHeroicLevel = Number(getItem(this.heroicLevelSettingId));
    return Number.isInteger(savedHeroicLevel) &&
      savedHeroicLevel >= 0 &&
      savedHeroicLevel <= this.settings.maxHeroicLevel
      ? savedHeroicLevel
      : 0;
  }

  updateVisibility() {
    const visible = this.settings.shuffleDifficulties;
    this.toggleVisibility(visible);
  }
}
