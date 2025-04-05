import { aspects } from "../data/cards.js";
import { deck } from "../data/deck.js";
import { getItem, resetItem, setItem } from "../data/storage.js";
import { chooseRandom, filter, passesRestriction } from "../helpers.js";
import { Section } from "./Section.js";

const BASIC = "Basic";

export class AspectSection extends Section {
  constructor(settings, nthOfType) {
    super(settings, aspects, nthOfType);
    this.suggestedCardsSettingId = this.id + "--setting--suggested-cards";
  }

  get valid() {
    if (!super.valid) {
      return false;
    }

    if (this.suggestedCards.length !== this.settings.numberOfSuggestedCards) {
      return false;
    }

    const validSuggestedCards = this.getValidSuggestedCards();
    return this.suggestedCards.every((card) =>
      validSuggestedCards.includes(card),
    );
  }

  get suggestedCards() {
    return this._suggestedCards || [];
  }

  set suggestedCards(value) {
    this.setSuggestedCards(value);
  }

  get cousinSections() {
    return (this._cousinSections ||= filter(this.aspectSections, [this]));
  }

  get previousCousinSections() {
    return (this._previousCousinSections ||= this.cousinSections.filter(
      (section) => section.nthOfType < this.nthOfType,
    ));
  }

  get cardSetSections() {
    return (this._cardSetSections ||= [
      this.scenarioSection,
      this.modularSection,
      this.heroSections[0],
      this.aspectSections[0],
    ]);
  }

  initializeSectionRelationships() {
    this.childSection = this.modularSection;
  }

  initializeLayout() {
    super.initializeLayout();

    const template = document.getElementById("suggested-cards");
    const element = template.content.firstElementChild.cloneNode(true);

    this.suggestedCardSlots = [];
    const slotTemplate = document.getElementById("suggested-card");
    for (let i = 0; i < this.settings.maxAllowedSuggestedCards; i++) {
      const slot = slotTemplate.content.firstElementChild.cloneNode(true);
      element.appendChild(slot);
      this.suggestedCardSlots.push(slot);
    }

    this.root.appendChild(element);
  }

  initializeCards() {
    this.suggestedCards = this.loadSuggestedCards();
    super.initializeCards();
  }

  setSuggestedCards(value) {
    this._suggestedCards = value;
    this.saveSuggestedCards(value);

    this.root.classList.toggle("hide-suggested-cards", value.length === 0);
    this.root.style.setProperty("--suggested-cards", value.length);

    for (let i = 0; i < this.suggestedCardSlots.length; i++) {
      const slot = this.suggestedCardSlots[i];
      const img = slot.querySelector("img");
      const name = slot.querySelector(".name");
      const subname = slot.querySelector(".subname");
      const aspect = slot.querySelector(".aspect");
      const type = slot.querySelector(".type");

      const card = value[i];
      slot.classList.toggle("hidden", !card);
      if (card) {
        slot.href = card.href;
        img.src = card.imgSrc;
        img.classList.toggle("landscape", card.landscape);
        name.innerText = card.name;
        subname.innerText = card.subname ? `(${card.subname})` : "";
        aspect.className = `aspect ${card.aspectCode}`;
        aspect.innerText = card.aspect;
        type.innerText = card.type;
      }
    }
  }

  shuffle({ animate = true, ...options } = {}) {
    super.shuffle({ animate, ...options });
    const validSuggestedCards = this.getValidSuggestedCards();
    const suggestedCards = [];
    for (let i = 0; i < this.settings.numberOfSuggestedCards; i++) {
      const options = filter(validSuggestedCards, suggestedCards);
      suggestedCards.push(chooseRandom(options));
    }
    suggestedCards.sort((c1, c2) => this.suggestedCardSort(c1, c2));
    this.runWithShuffle(() => (this.suggestedCards = suggestedCards), animate);
  }

  prioritise(aspects, isShuffleAll) {
    if (!this.settings.avoidRepeatedAspects) {
      return aspects;
    }

    const avoidedCousinSections = isShuffleAll
      ? this.previousCousinSections
      : this.cousinSections;

    const aspectUses = avoidedCousinSections.flatMap(
      (section) => section.trueCards,
    );

    const aspectUseCounts = Object.groupBy(
      aspects,
      (aspect) => aspectUses.filter((use) => use === aspect).length,
    );

    const minUseCount = Math.min(...Object.keys(aspectUseCounts));
    return aspectUseCounts[minUseCount];
  }

  loadSuggestedCards() {
    try {
      const suggestedCardIds = getItem(this.suggestedCardsSettingId);
      return suggestedCardIds
        ? suggestedCardIds
            .map((id) => deck.find((card) => card.id === id))
            .filter((card) => card !== undefined)
        : [];
    } catch (error) {
      return resetItem(this.suggestedCardsSettingId, [], error);
    }
  }

  saveSuggestedCards(suggestedCards) {
    const suggestedCardIds = suggestedCards.map((card) => card.id);
    setItem(this.suggestedCardsSettingId, suggestedCardIds);
  }

  getValidSuggestedCards() {
    const heroSection = this.parentSections[0];
    const hero = heroSection.trueCards[0];
    if (!this.visible || !hero) {
      return deck;
    }

    const allowedAspects = this.trueCards.map((aspect) => aspect.name);
    if (this.settings.includeBasicInSuggestedCards) {
      allowedAspects.push(BASIC);
    }

    const allowedSets = new Set(
      this.cardSetSections
        .flatMap((section) => section.cardsOrSets)
        .filter(
          (cardOrSet) => cardOrSet.checked || cardOrSet.anyDescendantChecked,
        )
        .concat(this.coreSet)
        .map((cardOrSet) => cardOrSet.name),
    );

    return deck
      .filter((card) => passesRestriction(card.packs, allowedSets))
      .filter((card) => canIncludeSuggestedCard(card, hero, allowedAspects));
  }

  suggestedCardSort(c1, c2) {
    const aspectOrder = this.trueCards
      .concat(this.selectableCards)
      .map((card) => card.name)
      .concat(BASIC);
    return (
      aspectOrder.indexOf(c1.aspect) - aspectOrder.indexOf(c2.aspect) ||
      c1.type.localeCompare(c2.type) ||
      c1.name.localeCompare(c2.name) ||
      (c1.subname || "").localeCompare(c2.subname || "")
    );
  }

  updateVisibility() {
    const visible = this.nthOfType <= this.settings.numberOfHeroes;
    this.toggleVisibility(visible);
  }
}

function canIncludeSuggestedCard(card, hero, allowedAspects) {
  if (card.aspect === BASIC && !allowedAspects.includes(BASIC)) {
    return false;
  }

  if (card.name === hero.name && [null, hero.subname].includes(card.subname)) {
    return false;
  }

  if (hero.include && hero.include(card)) {
    return true;
  }

  return (
    allowedAspects.includes(card.aspect) &&
    passesRestriction(card.teamUp, [hero.name, hero.subname]) &&
    passesRestriction(card.traitLocks, hero.traits) &&
    (card.minHp === null || hero.hp >= card.minHp)
  );
}
