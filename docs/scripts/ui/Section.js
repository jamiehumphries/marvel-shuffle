import {
  chooseRandom,
  filter,
  flatten,
  requestPostAnimationFrame,
} from "../helpers.js?v=b2f4ffde";
import { All } from "../models/All.js?v=3d6ffe3f";
import { CardTier } from "../models/CardTier.js?v=144c1d94";
import { getItem, setItem } from "../storage.js?v=b419bdb4";
import { Slot } from "./Slot.js?v=e530588f";
import { Toggleable } from "./Toggleable.js?v=683df3d1";

const cardChangeDelayMs = getComputedStyle(document.documentElement)
  .getPropertyValue("--card-change-delay")
  .slice(0, -1 * "ms".length);

export class Section extends Toggleable {
  constructor(
    settings,
    cardsOrSets,
    nthOfType,
    {
      extraCards = [],
      parentSection = null,
      previousSiblingSection = null,
    } = {},
  ) {
    super();
    this.settings = settings;
    this.cardsOrSets = cardsOrSets;
    this.sets = cardsOrSets.filter((set) => !!set.children);
    this.coreSet = this.sets.find((set) => set.name === "Core Set");
    this.selectableCards = flatten(this.cardsOrSets);

    this.nthOfType = nthOfType;
    this.extraCards = extraCards;

    this.parentSection = parentSection;

    if (this.parentSection) {
      this.parentSection.childSection = this;
    }

    this.allSiblingSections = previousSiblingSection
      ? [previousSiblingSection, ...previousSiblingSection.allSiblingSections]
      : [];

    for (const siblingSection of this.allSiblingSections) {
      siblingSection.allSiblingSections.push(this);
    }

    this.type = this.selectableCards.reduce((type, card) => {
      const cardType = card.type;
      if (type === null || type === cardType) {
        return cardType;
      }
      throw new Error("All cards for a section must be the same type.");
    }, null);

    this.id = this.type.id;
    if (this.nthOfType !== 1) {
      this.id += `-${this.nthOfType}`;
    }

    this.forcedSettingId = this.id + "--setting--forced";

    this.root = document.getElementById(this.id);
    this.initialized = false;
  }

  get sectionName() {
    return this.type.name;
  }

  get sectionNamePlural() {
    return this.type.namePlural;
  }

  get checkedCards() {
    return this.selectableCards.filter((card) => card.checked);
  }

  get maxSlots() {
    return (this._maxSlots ||= this.parentSection?.maxChildCardCount || 1);
  }

  get maxChildCardCount() {
    return Math.max(
      ...this.selectableCards.map((card) =>
        card.childCardCount(this.settings.maxNumberOfHeroes),
      ),
    );
  }

  get parentCard() {
    return this.parentSection?.trueCard;
  }

  get parentSet() {
    const parentSetName = this.parentCard?.parent?.name;
    return this.sets.find((set) => set.name === parentSetName);
  }

  get trueCard() {
    return this.maxSlots === 1 ? this.trueCards[0] : null;
  }

  get trueCards() {
    return this.incomingCards || this.cards;
  }

  get childCardCount() {
    return this.childSection && this.trueCard
      ? this.trueCard.childCardCount(this.settings.numberOfHeroes)
      : 0;
  }

  get previousSiblingSections() {
    return this.allSiblingSections.filter(
      (section) => section.nthOfType < this.nthOfType,
    );
  }

  get visibleSiblingSections() {
    return this.allSiblingSections.filter((section) => section.visible);
  }

  get expectedCardCount() {
    return this.parentSection ? this.parentSection.childCardCount : 1;
  }

  get valid() {
    if (this.cards.length !== this.expectedCardCount) {
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
    return this.cards.every((card, i) => optionSets[i]?.includes(card));
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

  initialize() {
    this.initializeLayout();
    this.initializeOptions();
    this.initializeShuffling();
    this.initializeCards();
    this.initialized = true;
  }

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

    const optionsHint = document.createElement("p");
    const noOrTooFew =
      this.maxSlots === 1 && this.allSiblingSections.length === 0
        ? "no"
        : "too few";
    optionsHint.classList.add("options-hint");
    optionsHint.innerText = `If ${noOrTooFew} ${this.sectionNamePlural} are selected, `;
    optionsHint.innerText += this.parentSection
      ? `${this.parentSection.type.name} default(s) will be used`
      : `Core Set ${this.sectionNamePlural} will be used`;
    options.appendChild(optionsHint);

    const all = new All(this);
    all.appendTo(options);

    for (const cardOrSet of this.cardsOrSets) {
      cardOrSet.appendTo(options);
    }

    if (getItem(this.id) === null) {
      this.coreSet.checked = true;
    }
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
    this.shuffleIfInvalid({ animate: false, isInitialize: true });
  }

  shuffleIfInvalid({ animate = true, isInitialize = false } = {}) {
    if (!this.valid && !this.disabled) {
      this.shuffle({ animate, isInitialize });
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
      : this.visibleSiblingSections;

    const exclude = this.parentCard
      ? this.parentCard.excludedChildCards
      : exclusiveSiblingSections.flatMap((section) => section.trueCards);

    const tiers = this.getCardOptionTiers();

    const optionsSets = [];
    for (const tier of tiers) {
      const numberNeeded = this.expectedCardCount - optionsSets.length;
      const cardOptions = filter(tier.cards, exclude);

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

  getPriorityFromTracking() {
    return 1;
  }

  getCardOptionTiers() {
    return [
      new CardTier(this.parentCard?.requiredChildCards, true),
      new CardTier(this.checkedCards),
      new CardTier(this.parentCard?.defaultChildCards, true),
      new CardTier(this.parentSet?.children),
      new CardTier(this.coreSet.children),
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
}
