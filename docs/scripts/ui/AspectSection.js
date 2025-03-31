import { aspects } from "../data/cards.js?v=9a2e587a";
import { deck } from "../data/deck.js?v=00000000";
import { getItem, setItem } from "../data/storage.js?v=e77ff9b5";
import { chooseRandom, filter } from "../helpers.js?v=01996c74";
import { Section } from "./Section.js?v=cee48f1c";

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

  initializeSectionRelationships() {
    this.childSection = this.modularSection;
  }

  initializeLayout() {
    super.initializeLayout();

    const template = document.getElementById("suggested-cards");
    const element = template.content.firstElementChild.cloneNode(true);

    this.suggestedCardSlots = [];
    const slotTemplate = document.getElementById("suggested-card");
    for (let i = 0; i < this.settings.maxNumberOfSuggestedCards; i++) {
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
    const validOptions = this.getValidSuggestedCards();
    console.log(validOptions.map((card) => card.name).sort());
    const suggestedCards = [];
    for (let i = 0; i < this.settings.numberOfSuggestedCards; i++) {
      const options = filter(validOptions, suggestedCards);
      suggestedCards.push(chooseRandom(options));
    }
    suggestedCards.sort((c1, c2) => this.suggestedCardSort(c1, c2));
    this.runWithShuffle(() => (this.suggestedCards = suggestedCards), animate);
  }

  loadSuggestedCards() {
    try {
      const suggestedCardIds = getItem(this.suggestedCardsSettingId);
      return suggestedCardIds
        ? suggestedCardIds
            .map((id) => deck.find((card) => card.id === id))
            .filter((card) => card !== undefined)
        : [];
    } catch {
      clearStorage();
      return [];
    }
  }

  saveSuggestedCards(suggestedCards) {
    const suggestedCardIds = suggestedCards.map((card) => card.id);
    setItem(this.suggestedCardsSettingId, suggestedCardIds);
  }

  getValidSuggestedCards() {
    const hero = this.parentSections[0].trueCards[0];
    if (!this.visible || !hero) {
      return deck;
    }

    const allowedAspects = this.trueCards.map((aspect) => aspect.name);
    if (this.settings.includeBasicInSuggestedCards) {
      allowedAspects.push(BASIC);
    }
    return deck.filter((card) => allowedAspects.includes(card.aspect));
  }

  suggestedCardSort(c1, c2) {
    const aspectOrder = [...this.trueCards.map((aspect) => aspect.name), BASIC];
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
