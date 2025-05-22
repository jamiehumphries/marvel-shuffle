import { getItem, resetItem, setItem } from "../data/storage.js?v=5a17bb47";
import {
  chooseRandom,
  filter,
  requestPostAnimationFrame,
} from "../helpers.js?v=fce4bec0";
import { All } from "../models/All.js?v=a11516d1";
import { Aspect } from "../models/Aspect.js?v=c2180381";
import { CardTier } from "../models/CardTier.js?v=2604c80d";
import { Difficulty } from "../models/Difficulty.js?v=3260d64c";
import { Hero } from "../models/Hero.js?v=a2b165d5";
import { Modular } from "../models/Modular.js?v=84e4ccc8";
import { Scenario } from "../models/Scenario.js?v=3c492c30";
import { Slot } from "./Slot.js?v=af24df45";
import { Toggleable } from "./Toggleable.js?v=8474d19e";

const cardChangeDelayMs = getComputedStyle(document.documentElement)
  .getPropertyValue("--card-change-delay")
  .slice(0, -1 * "ms".length);

export class Section extends Toggleable {
  constructor(settings, cardsOrSets, nthOfType, extraCards = []) {
    super();
    this.settings = settings;
    this.cardsOrSets = cardsOrSets;
    this.nthOfType = nthOfType;
    this.extraCards = extraCards;
    this.isInitialized = false;

    this.sets = cardsOrSets.filter((set) => !!set.children);
    this.coreSet = this.sets.find((set) => set.name === "Core Set");
    this.selectableCards = flatten(this.cardsOrSets);
    this.uncountedCards = this.extraCards.filter((card) => card.isUncounted);

    const types = this.selectableCards.map((card) => card.type);
    if (new Set(types).size !== 1) {
      throw new Error("All cards for a section must be the same type.");
    }

    this.type = types[0];
    this.id = this.type.id + (nthOfType === 1 ? "" : `-${nthOfType}`);
    this.root = document.getElementById(this.id);
    this.forcedSettingId = this.id + "--setting--forced";

    this.parentSections = [];
    this.siblingSections = [];
  }

  get sectionName() {
    return (this._sectionName ||= this.type.name);
  }

  get sectionNamePlural() {
    return (this._sectionNamePlural ||= this.type.namePlural);
  }

  get maxSlots() {
    if (this._maxSlots) {
      return this._maxSlots;
    }

    if (this.parentSections.length === 0) {
      this._maxSlots = 1;
      return this._maxSlots;
    }

    const maxHeroes = this.settings.maxAllowedHeroes;
    const sum = (count, section) => {
      const childCardCounts = section.selectableCards.map((card) =>
        card.childCardCount(maxHeroes),
      );
      return count + Math.max(...childCardCounts);
    };

    return this.parentSections.reduce(sum, 0);
  }

  get childSection() {
    return this._childSection;
  }

  set childSection(value) {
    value.parentSections.push(this);
    this._childSection = value;
  }

  get previousSiblingSections() {
    return (this._previousSiblingSections ||= this.siblingSections.filter(
      (section) => section.nthOfType < this.nthOfType,
    ));
  }

  get checkedCards() {
    return this.visible
      ? this.selectableCards.filter((card) => card.checked)
      : [];
  }

  get parentCards() {
    return distinct(
      this.parentSections.flatMap((section) => section.trueCards),
    );
  }

  get parentSet() {
    const primaryParentSetName = this.parentCards[0]?.parent?.name;
    return this.sets.find((set) => set.name === primaryParentSetName);
  }

  get trueCards() {
    return this.visible ? this.incomingCards || this.cards || [] : [];
  }

  get requiredCards() {
    return this.flattenParentCards((card) => card.requiredChildCards);
  }

  get defaultCards() {
    return this.flattenParentCards((card) => card.defaultChildCards);
  }

  get excludedCards() {
    return this.flattenParentCards((card) => card.excludedChildCards);
  }

  get placeholder() {
    return null;
  }

  get baseCount() {
    if (this.parentCards.length === 0) {
      return 1;
    }
    const heroCount = this.settings.numberOfHeroes;
    const sum = (count, card) => count + card.childCardCount(heroCount);
    return this.parentCards.reduce(sum, 0);
  }

  get minCount() {
    return this.baseCount;
  }

  get maxCount() {
    return this.baseCount;
  }

  get valid() {
    const countedCards = this.cards.filter(
      (card) => !card.isUncounted || this.requiredCards.includes(card),
    );

    const count = countedCards.length;

    if (count < this.minCount || count > this.maxCount) {
      return false;
    }

    const hasDuplicates = this.cards.length !== new Set(this.cards).size;
    if (hasDuplicates) {
      return false;
    }

    if (this.forced) {
      return true;
    }

    const optionSets = this.getCardOptionSets(count);
    return optionSets.every((set, i) => set.includes(this.cards[i]));
  }

  get visible() {
    return !this.root.classList.contains("hidden");
  }

  get disabled() {
    return this.button.disabled;
  }

  set disabled(value) {
    this.button.disabled = value;
  }

  get forced() {
    return getItem(this.forcedSettingId);
  }

  set forced(value) {
    setItem(this.forcedSettingId, value);
  }

  get cards() {
    return this._cards || [];
  }

  set cards(value) {
    this.setCards(value);
  }

  initialize(sections) {
    this.initializeSectionMapping(sections);
    this.initializeSectionRelationships();
    this.initializeLayout();
    this.initializeOptions();
    this.initializeShuffling();
    this.initializeCards();
    this.updateVisibility();
    this.isInitialized = true;
  }

  initializeSectionMapping(sections) {
    const getSections = (type) =>
      sections.filter((section) => section.type.name === type.name);
    const getSection = (type, n = 1) =>
      getSections(type).find((section) => section.nthOfType === n);
    this.scenarioSection = getSection(Scenario);
    this.difficultySection = getSection(Difficulty);
    this.modularSection = getSection(Modular, 1);
    this.extraModularSection = getSection(Modular, 2);
    this.heroSections = getSections(Hero);
    this.aspectSections = getSections(Aspect);
  }

  initializeSectionRelationships() {}

  initializeLayout() {
    const sectionTemplate = document.getElementById("section");
    const element = sectionTemplate.content.cloneNode(true);
    this.root.appendChild(element);

    this.name = this.root.querySelector(".type-name");
    this.name.innerText = this.sectionName;
    const selectText = `Select ${this.sectionNamePlural}`;
    this.root.querySelector(".select").innerText = selectText;

    const slotsContainer = this.root.querySelector(".slots");
    const slotTemplate = document.getElementById("slot");
    for (let i = 0; i < this.maxSlots; i++) {
      const element = slotTemplate.content.firstElementChild.cloneNode(true);
      slotsContainer.appendChild(element);
    }

    this.slots = Array.from(this.root.querySelectorAll(".slot")).map(
      (element) => new Slot(element),
    );
  }

  initializeOptions() {
    if (this.nthOfType !== 1) {
      return;
    }

    const options = this.root.querySelector(".options");
    const optionsHint = this.buildOptionsHint();
    options.appendChild(optionsHint);

    const all = new All(this);
    all.appendTo(options);

    for (const cardOrSet of this.cardsOrSets) {
      cardOrSet.appendTo(options);
    }

    if (getItem(this.id) === null && this.coreSet !== undefined) {
      this.coreSet.checked = true;
    }
  }

  buildOptionsHint() {
    const namePlural = this.sectionNamePlural.toLowerCase();
    const primaryParentName = this.parentSections[0]?.type.name.toLowerCase();
    const hintParts = [
      "If",
      this.maxSlots === 1 && this.siblingSections.length === 0
        ? "no"
        : "too few",
      namePlural,
      "are selected,",
      primaryParentName
        ? `${primaryParentName} default(s) will be used`
        : `Core Set ${namePlural} will be used`,
    ];

    const optionsHint = document.createElement("p");
    optionsHint.classList.add("options-hint");
    optionsHint.innerText = hintParts.join(" ");

    return optionsHint;
  }

  initializeShuffling() {
    this.button = this.root.querySelector("button");
    this.button.addEventListener("click", () => this.shuffle());
    this.root.addEventListener("transitionend", (event) =>
      this.onTransitionEnd(event),
    );
  }

  initializeCards() {
    this.cards = this.loadCards();
    this.shuffleIfInvalid({ animate: false });
  }

  setCards(value) {
    this._cards = value;
    this.saveCards(value);

    this.name.innerText =
      value.length === 1 ? this.sectionName : this.sectionNamePlural;

    const slotCards =
      value.length === 0 && this.placeholder ? [this.placeholder] : value;

    const { style } = this.root;
    const landscapeCount = slotCards.filter((card) => card.isLandscape).length;
    const portraitCount = slotCards.length - landscapeCount;
    style.setProperty("--landscape-cards-in-section", landscapeCount);
    style.setProperty("--portrait-cards-in-section", portraitCount);

    for (let i = 0; i < this.slots.length; i++) {
      this.slots[i].card = slotCards[i];
    }

    this.dispatchEvent(new Event("cardsupdated"));
  }

  shuffleIfInvalid({ animate = true } = {}) {
    if (!this.valid && !this.disabled) {
      this.shuffle({ animate });
      return true;
    }
    return false;
  }

  shuffle({ forcedCards = null, animate = true, isShuffleAll = false } = {}) {
    this.forced = forcedCards !== null;
    const newCards = forcedCards || this.chooseCards(isShuffleAll);

    if (!animate || !this.visible) {
      this.cards = newCards;
      return;
    }

    // Preload new images.
    for (let i = 0; i < newCards.length; i++) {
      const oldCard = this.cards[i];
      const newCard = newCards[i];
      for (const src of ["frontSrc", "backSrc"]) {
        if (newCard[src] !== oldCard?.[src]) {
          new Image().src = newCard[src];
        }
      }
    }

    this.disabled = true;
    this.dispatchEvent(new Event("shufflestart"));

    document.body.classList.add("shuffling");
    this.root.classList.add("flipping");
    this.root.classList.remove("giant", "wide");
    this.incomingCards = newCards;
    setTimeout(() => (this.cards = newCards), cardChangeDelayMs);
  }

  chooseCards(isShuffleAll) {
    const count = this.getRandomCount();
    const optionSets = this.getCardOptionSets(count, isShuffleAll);
    const cards = [];
    for (const optionSet of optionSets) {
      const filteredOptionSet = filter(optionSet, cards);
      const card = this.randomCard(filteredOptionSet, isShuffleAll);
      cards.push(card);
    }
    return cards;
  }

  getRandomCount() {
    const rangeSize = this.maxCount - this.minCount + 1;
    return this.minCount + Math.floor(Math.random() * rangeSize);
  }

  getCardOptionSets(count, isShuffleAll = false) {
    if (count === 0) {
      return [];
    }

    const exclusiveSiblingSections = isShuffleAll
      ? this.previousSiblingSections
      : this.siblingSections;

    const exclude = this.excludedCards.concat(
      exclusiveSiblingSections.flatMap((section) => section.trueCards),
    );

    const tiers = this.getCardOptionTiers();

    const optionsSets = [];
    for (const tier of tiers) {
      const numberNeeded = count - optionsSets.length;
      const cardOptions = tier.isRequired
        ? tier.cards
        : filter(tier.cards, exclude);

      const tierOptionSets =
        tier.isOrdered && cardOptions.length <= numberNeeded
          ? cardOptions.map((card) => [card])
          : Array(Math.min(numberNeeded, cardOptions.length)).fill(cardOptions);

      optionsSets.push(...tierOptionSets);

      if (optionsSets.length === count) {
        break;
      }
    }

    return optionsSets;
  }

  randomCard(options, isShuffleAll) {
    const prioritisedOptions = this.prioritise(options, isShuffleAll);
    return chooseRandom(
      prioritisedOptions.length > 0 ? prioritisedOptions : options,
    );
  }

  prioritise(options, isShuffleAll) {
    return options.flatMap((card) => {
      const priority = this.getPriority(card, isShuffleAll);
      return Array(priority).fill(card);
    });
  }

  getPriority(_option, _isShuffleAll) {
    return 1;
  }

  getCardOptionTiers() {
    const isOrdered = true;
    const isRequired = true;
    return [
      new CardTier(this.requiredCards, { isOrdered, isRequired }),
      new CardTier(this.checkedCards),
      new CardTier(this.defaultCards, { isOrdered }),
      new CardTier(this.parentSet?.children),
      new CardTier(this.coreSet?.children),
    ].filter((tier) => tier.cards?.length > 0);
  }

  onTransitionEnd(event) {
    const { propertyName, target } = event;
    if (propertyName !== "transform" || target !== this.slots[0].root) {
      return;
    }

    document.body.classList.remove("shuffling");
    this.root.classList.remove("flipping");
    this.root.classList.add("flipped");
    this.disabled = false;
    this.incomingCards = null;
    this.dispatchEvent(new Event("shuffleend"));

    this.childSection?.shuffleIfInvalid();

    requestPostAnimationFrame(() => this.root.classList.remove("flipped"));
  }

  loadCards() {
    try {
      const savedCardIds = getItem(this.id);
      const allCards = this.selectableCards.concat(this.extraCards);
      return savedCardIds
        ? savedCardIds
            .map((id) => allCards.find((card) => card.id === id))
            .filter((card) => card !== undefined)
        : [];
    } catch (error) {
      return resetItem(this.id, [], error);
    }
  }

  saveCards(cards) {
    const cardIds = cards.map((card) => card.id);
    setItem(this.id, cardIds);
  }

  updateVisibility() {
    this.show();
  }

  runWithShuffle(callback, animate) {
    if (animate && this.visible) {
      setTimeout(callback, cardChangeDelayMs);
    } else {
      callback();
    }
  }

  flattenParentCards(selector) {
    return distinct(this.parentCards.flatMap(selector));
  }
}

function flatten(cardsOrSets) {
  return cardsOrSets.flatMap((cardOrSet) => cardOrSet.children || [cardOrSet]);
}

function distinct(array) {
  return [...new Set(array)];
}
