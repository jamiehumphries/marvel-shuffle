import { All } from "./options.js";
import { scenarios, modules, heroes, aspects } from "./cards.js";

const cardChangeDelayMs = Number(
  getComputedStyle(document.documentElement).getPropertyValue(
    "--card-change-delay-ms"
  )
);

function appendSectionTo(parent) {
  const template = document.getElementById("section");
  const element = template.content.cloneNode(true);
  parent.appendChild(element);
}

function appendSlotTo(parent) {
  const template = document.getElementById("slot");
  const element = template.content.firstElementChild.cloneNode(true);
  parent.appendChild(element);
}

class Section {
  constructor(cardsOrSets, parentSection = null) {
    // Initialize data.
    this.cardsOrSets = cardsOrSets;
    this.parentSection = parentSection;
    this.maxSlots = parentSection?.maxChildCardCount || 1;
    if (this.parentSection) {
      this.parentSection.childSection = this;
    }

    this.allCards = cardsOrSets.reduce((cards, cardOrSet) => {
      return cards.concat(cardOrSet.children || [cardOrSet]);
    }, []);

    this.type = this.allCards.reduce((type, card) => {
      const cardType = card.constructor;
      if (type == null || type == cardType) {
        return cardType;
      }
      throw new Error("All cards for a section must be the same type.");
    }, null);

    // Initialize layout.
    this.root = document.getElementById(this.type.id);
    appendSectionTo(this.root);

    const nameText = this.type.name;
    this.name = this.root.querySelector(".type-name");
    this.name.innerText = nameText;
    const selectText = `Select ${this.type.namePlural}`;
    this.root.querySelector(".select").innerText = selectText;

    const slots = this.root.querySelector(".slots");
    for (let i = 0; i < this.maxSlots; i++) {
      appendSlotTo(slots);
    }

    // Initialize options.
    const options = this.root.querySelector(".options");
    const all = new All(this);
    all.appendTo(options);
    this.cardsOrSets.forEach((cardOrSet) => cardOrSet.appendTo(options));
    options.addEventListener("submit", (event) => {
      event.preventDefault();
      toggleSettings();
    });

    // Initialize slots.
    this.slots = Array.from(this.root.querySelectorAll(".slot")).map(
      (element) => new Slot(element)
    );

    // Initialize cards.
    let savedCards;
    try {
      const savedCardIds = JSON.parse(localStorage.getItem(this.type.id)) || [];
      savedCards = savedCardIds.map((id) =>
        this.allCards.find((card) => card.id === id)
      );
    } catch {
      localStorage.clear();
      savedCards = [];
    }
    this.cards = savedCards.length > 0 ? savedCards : [this.randomCard()];

    // Add event listeners.
    this.button = this.root.querySelector("button");
    this.button.addEventListener("click", () => {
      const childCardCountBefore = this.childCardCount;
      this.shuffle({ preventRepeat: true });
      this.shuffleChildSection = this.childCardCount !== childCardCountBefore;
    });
    this.root.addEventListener("transitionend", (event) =>
      this.onTransitionEnd(event)
    );
  }

  get maxChildCardCount() {
    return Math.max(...this.allCards.map((card) => card.childCardCount));
  }

  get childCardCount() {
    return (this.incomingCards || this.cards)[0].childCardCount;
  }

  get disabled() {
    return this.button.disabled;
  }

  set disabled(value) {
    this.button.disabled = value;
    setGlobalButtonsAvailability();
  }

  get cards() {
    return this._cards || [];
  }

  set cards(value) {
    const newCards = value;
    this._cards = newCards;

    this.name.innerText =
      newCards.length === 1 ? this.type.name : this.type.namePlural;

    const { style } = this.root;
    const landscapeCount = newCards.filter((card) => card.isLandscape).length;
    const portraitCount = newCards.length - landscapeCount;
    style.setProperty("--landscape-cards-in-section", landscapeCount);
    style.setProperty("--portrait-cards-in-section", portraitCount);

    for (let i = 0; i < this.slots.length; i++) {
      this.slots[i].card = newCards[i];
    }

    const cardIds = newCards.map((card) => card.id);
    localStorage.setItem(this.type.id, JSON.stringify(cardIds));
  }

  shuffle({ preventRepeat = false } = {}) {
    this.disabled = true;
    this.root.classList.add("flipping");

    const cardCount = this.parentSection?.childCardCount || 1;
    const newCards = [];

    for (let i = 0; i < cardCount; i++) {
      const oldCard = this.cards[i];
      const exclude = newCards;
      const preferExclude = preventRepeat ? oldCard : null;
      const newCard = this.randomCard({ exclude, preferExclude });
      newCards.push(newCard);

      // Preload new images.
      for (const src of ["frontSrc", "backSrc"]) {
        if (newCard[src] !== oldCard?.[src]) {
          new Image().src = newCard[src];
        }
      }
    }

    this.incomingCards = newCards;
    setTimeout(() => (this.cards = newCards), cardChangeDelayMs);
  }

  randomCard({ exclude = [], preferExclude = null } = []) {
    let availableCards = this.allCards.filter(
      (card) => card.checked && !exclude.includes(card)
    );

    if (preferExclude !== null && availableCards.length > 1) {
      availableCards = availableCards.filter((card) => card !== preferExclude);
    }

    if (availableCards.length === 0) {
      this.selectMoreOptions();
      return this.randomCard();
    }

    return availableCards[Math.floor(Math.random() * availableCards.length)];
  }

  selectMoreOptions() {
    const firstUncheckedOption = this.cardsOrSets.find(
      (cardOrSet) => !cardOrSet.checked
    );
    firstUncheckedOption.checked = true;
  }

  onTransitionEnd(event) {
    const { propertyName, target } = event;
    if (propertyName !== "transform" || target !== this.slots[0].root) {
      return;
    }

    this.root.classList.remove("flipping");
    this.root.classList.add("flipped");
    this.disabled = false;
    this.incomingCards = null;

    if (this.shuffleChildSection) {
      this.childSection.shuffle();
      this.shuffleChildSection = false;
    }

    maybeReturnFocusAfterShuffle();
    requestPostAnimationFrame(() => this.root.classList.remove("flipped"));
  }
}

class Slot {
  constructor(root) {
    this.root = root;
    this.name = root.querySelector(".name");
    this.cardFront = root.querySelector("img.front");
    this.cardBack = root.querySelector("img.back");
  }

  get card() {
    return this._card;
  }

  set card(value) {
    const oldCard = this._card;
    const newCard = value;
    this._card = newCard;

    if (!newCard) {
      this.hide();
      return;
    }

    if (newCard === oldCard) {
      return;
    }

    this.show();
    this.root.classList.toggle("landscape", newCard.isLandscape);
    this.name.innerText = newCard.name;
    this.cardFront.src = newCard.frontSrc;
    if (newCard.backSrc !== oldCard?.backSrc) {
      this.cardBack.src = newCard.backSrc;
    }
  }

  show() {
    this.toggleVisibility(true);
  }

  hide() {
    this.toggleVisibility(false);
  }

  toggleVisibility(value) {
    this.root.classList.toggle("hidden", !value);
  }
}

const container = document.querySelector(".container");
const settingsButton = document.getElementById("settings");
const shuffleAllButton = document.getElementById("shuffle-all");
const shuffleButtons = Array.from(document.getElementsByClassName("shuffle"));
let lastClickedButton = null;

const scenario = new Section(scenarios);
const module = new Section(modules, scenario);
const hero = new Section(heroes);
const aspect = new Section(aspects, hero);
const sections = [scenario, module, hero, aspect];

function shuffleAll() {
  sections.forEach((section) => section.shuffle());
}

function toggleSettings() {
  const settingsVisible = container.classList.toggle("show-settings");
  shuffleButtons.forEach((button) => (button.disabled = settingsVisible));
  if (!settingsVisible) {
    requestPostAnimationFrame(() => shuffleAll());
  }
}

function setGlobalButtonsAvailability() {
  const disabled = sections.some((section) => section.disabled);
  shuffleAllButton.disabled = disabled;
  settingsButton.disabled = disabled;
}

function maybeReturnFocusAfterShuffle() {
  if (lastClickedButton && !lastClickedButton.disabled) {
    lastClickedButton.focus();
  }
}

function requestPostAnimationFrame(callback) {
  requestAnimationFrame(() => {
    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = callback;
    messageChannel.port2.postMessage(undefined);
  });
}

// Initialisation steps.

window.addEventListener("keydown", () => {
  container.classList.add("keyboard-nav");
  lastClickedButton = null;
});

window.addEventListener("mousedown", () => {
  container.classList.remove("keyboard-nav");
  lastClickedButton = null;
});

window.addEventListener("click", (event) => {
  lastClickedButton = event.target.tagName === "BUTTON" ? event.target : null;
});

shuffleAllButton.addEventListener("click", () => shuffleAll());
settingsButton.addEventListener("click", () => toggleSettings());

setTimeout(() => container.classList.remove("init"), 100);
