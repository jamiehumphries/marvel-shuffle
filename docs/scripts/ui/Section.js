import { getItem, setItem } from "../data/storage.js?v=b7e72aeb";
import { filter, requestPostAnimationFrame } from "../helpers.js?v=01996c74";
import { All } from "../models/All.js?v=8dd09771";
import { Aspect } from "../models/Aspect.js?v=db2ed670";
import { CardTier } from "../models/CardTier.js?v=2604c80d";
import { Difficulty } from "../models/Difficulty.js?v=a00021c7";
import { Hero } from "../models/Hero.js?v=7878eb4c";
import { Modular } from "../models/Modular.js?v=67f6abb2";
import { Scenario } from "../models/Scenario.js?v=7b9509d4";
import { Slot } from "./Slot.js?v=5de324b8";
import { Toggleable } from "./Toggleable.js?v=8474d19e";

export const cardChangeDelayMs = getComputedStyle(document.documentElement)
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

    const maxHeroes = this.settings.maxNumberOfHeroes;
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

  get expectedCardCount() {
    if (this.parentCards.length === 0) {
      return 1;
    }
    const heroCount = this.settings.numberOfHeroes;
    const sum = (count, card) => count + card.childCardCount(heroCount);
    return this.parentCards.reduce(sum, 0);
  }

  get valid() {
    const countedCards = this.cards.filter(
      (card) => !card.isUncounted || this.requiredCards.includes(card),
    );

    if (countedCards.length !== this.expectedCardCount) {
      return false;
    }

    const hasDuplicates = this.cards.length !== new Set(this.cards).size;
    if (hasDuplicates) {
      return false;
    }

    if (this.forced) {
      return true;
    }

    const optionSets = this.getCardOptionSets();
    return optionSets.every((set, i) => set?.includes(this.cards[i]));
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
      value.length === 0 && this.type.placeholder
        ? [this.type.placeholder]
        : value;

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
    const optionSets = this.getCardOptionSets(isShuffleAll);
    const cards = [];
    for (const optionSet of optionSets) {
      const filteredOptionSet = filter(optionSet, cards);
      const card = this.randomCard(filteredOptionSet, isShuffleAll);
      cards.push(card);
    }
    return cards;
  }

  getCardOptionSets(isShuffleAll = false) {
    if (this.expectedCardCount === 0) {
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
      const numberNeeded = this.expectedCardCount - optionsSets.length;
      const cardOptions = tier.isRequired
        ? tier.cards
        : filter(tier.cards, exclude);

      const tierOptionSets =
        tier.isOrdered && cardOptions.length <= numberNeeded
          ? cardOptions.map((card) => [card])
          : Array(Math.min(numberNeeded, cardOptions.length)).fill(cardOptions);

      optionsSets.push(...tierOptionSets);

      if (optionsSets.length === this.expectedCardCount) {
        break;
      }
    }

    return optionsSets;
  }

  randomCard(options, isShuffleAll) {
    const prioritisedOptions = options.flatMap((card) => {
      const priority = this.getPriority(card, isShuffleAll);
      return Array(priority).fill(card);
    });
    return chooseRandom(
      prioritisedOptions.length > 0 ? prioritisedOptions : options,
    );
  }

  getPriority(card, isShuffleAll) {
    return this.settings.avoidCompleted
      ? this.getPriorityFromTracking(card, isShuffleAll)
      : 1;
  }

  getPriorityFromTracking(_card, _isShuffleAll) {
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
    } catch {
      clearStorage();
      return [];
    }
  }

  saveCards(cards) {
    const cardIds = cards.map((card) => card.id);
    setItem(this.id, cardIds);
  }

  updateVisibility() {
    this.show();
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

function chooseRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}
