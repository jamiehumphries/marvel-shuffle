import { All } from "./options.js";
import { scenarios, modules, heroes, aspects } from "./cards.js";

const cardChangeDelayMs = Number(
  getComputedStyle(document.documentElement).getPropertyValue(
    "--card-change-delay-ms"
  )
);

const sectionTemplate = document.getElementById("section");

class Section {
  constructor(cardsOrSets) {
    this.cardsOrSets = cardsOrSets;

    this.cards = cardsOrSets.reduce((cards, cardOrSet) => {
      return cards.concat(cardOrSet.children || [cardOrSet]);
    }, []);

    this.type = this.cards.reduce((type, card) => {
      const cardType = card.constructor;
      if (type == null || type == cardType) {
        return cardType;
      }
      throw new Error("All cards for a section must be the same type.");
    }, null);

    const container = document.getElementById(this.type.id);
    container.appendChild(sectionTemplate.content.cloneNode(true));

    container.querySelector(".type-name").innerText = this.type.name;
    container.querySelector(
      ".select-cards"
    ).innerText = `Select ${this.type.namePlural}`;

    this.elements = {
      button: container.querySelector("button"),
      options: container.querySelector(".options"),
      name: container.querySelector(".name"),
      slot: container.querySelector(".slot"),
      cardFront: container.querySelector("img.front"),
      cardBack: container.querySelector("img.back"),
    };
  }
  get card() {
    return this._card;
  }

  set card(value) {
    const oldCard = this._card;
    const newCard = value;

    if (newCard === oldCard) {
      return;
    }

    this.elements.slot.classList.toggle("landscape", newCard.isLandscape);
    this.elements.name.innerText = newCard.name;
    this.elements.cardFront.src = newCard.frontSrc;
    if (newCard.backSrc !== oldCard?.backSrc) {
      this.elements.cardBack.src = newCard.backSrc;
    }

    this._card = value;
    localStorage.setItem(this.type.id, value.id);
  }

  get disabled() {
    return this.elements.button.disabled;
  }

  set disabled(value) {
    this.elements.button.disabled = value;
    setGlobalButtonsAvailability();
  }

  initialize() {
    const all = new All(this);
    all.appendTo(this.elements.options);
    this.cardsOrSets.forEach((cardOrSet) =>
      cardOrSet.appendTo(this.elements.options)
    );
    this.elements.options.addEventListener("submit", (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      toggleSettings();
    });

    const savedCardId = localStorage.getItem(this.type.id);
    const savedCard = this.cards.find((card) => card.id === savedCardId);
    this.card = savedCard || this.randomCard();

    this.elements.button.addEventListener("click", () => this.shuffle(true));
    this.elements.slot.addEventListener("transitionend", (event) =>
      this.onTransitionEnd(event)
    );
  }

  randomCard(preventRepeat = false) {
    let availableCards = this.cards.filter((card) => card.checked);
    if (availableCards.length > 1 && preventRepeat) {
      availableCards = availableCards.filter((card) => card !== this.card);
    }
    if (availableCards.length < 1) {
      const firstUncheckedOption = this.cardsOrSets.find(
        (cardOrSet) => !cardOrSet.checked
      );
      firstUncheckedOption.checked = true;
      return this.randomCard(preventRepeat);
    }
    return availableCards[Math.floor(Math.random() * availableCards.length)];
  }

  shuffle(preventRepeat = false) {
    const newCard = this.randomCard(preventRepeat);
    this.disabled = true;
    this.elements.slot.classList.add("flipping");

    // Preload new images.
    for (const src of ["frontSrc", "backSrc"]) {
      if (newCard[src] !== this.card?.[src]) {
        new Image().src = newCard[src];
      }
    }

    setTimeout(() => (this.card = newCard), cardChangeDelayMs);
  }

  onTransitionEnd(event) {
    const { propertyName, target } = event;
    if (propertyName !== "transform" || target !== this.elements.slot) {
      return;
    }
    this.elements.slot.classList.remove("flipping");
    this.elements.slot.classList.add("flipped");
    this.disabled = false;
    maybeReturnFocusAfterShuffle();
    requestPostAnimationFrame(() =>
      this.elements.slot.classList.remove("flipped")
    );
  }
}

const container = document.querySelector(".container");
const settingsButton = document.getElementById("settings");
const shuffleAllButton = document.getElementById("shuffle-all");
const shuffleButtons = Array.from(document.getElementsByClassName("shuffle"));
let lastClickedButton = null;

const sections = [
  new Section(scenarios),
  new Section(modules),
  new Section(heroes),
  new Section(aspects),
];

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

sections.forEach((section) => section.initialize());
shuffleAllButton.addEventListener("click", () => shuffleAll());
settingsButton.addEventListener("click", () => toggleSettings());

setTimeout(() => container.classList.remove("init"), 100);
