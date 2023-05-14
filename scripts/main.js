import copyTextToClipboard from "./lib/copy-text-to-clipboard.js";
import { All } from "./options.js?v=db";
import { scenarios, modules, heroes, aspects } from "./cards.js?v=db";
import {
  initializeStorage,
  clearStorage,
  getSyncUrl,
  setUserId,
  getItem,
  setItem,
} from "./storage.js?v=db";

const cardChangeDelayMs = Number(
  getComputedStyle(document.documentElement)
    .getPropertyValue("--card-change-delay")
    .slice(0, -1 * "ms".length)
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
    this.cardsOrSets = cardsOrSets;
    this.parentSection = parentSection;
  }

  get minChildCardCount() {
    return Math.max(...this.allCards.map((card) => card.childCardCount));
  }

  get maxChildCardCount() {
    return Math.max(...this.allCards.map((card) => card.childCardCount));
  }

  get primaryCard() {
    return (this.incomingCards || this.cards)[0];
  }

  get childCardCount() {
    return this.primaryCard?.childCardCount || 0;
  }

  get excludedChildCards() {
    return this.primaryCard?.excludedChildCards || [];
  }

  get defaultChildCards() {
    return this.primaryCard?.defaultChildCards;
  }

  get valid() {
    const parentSection = this.parentSection;

    const actualCount = this.cards.length;
    const expectedCount = parentSection ? parentSection.childCardCount : 1;
    const uniqueCount = new Set(this.cards).size;
    if (actualCount !== expectedCount || actualCount !== uniqueCount) {
      return false;
    }

    const exclude = parentSection?.excludedChildCards || [];
    const included = (cards) => cards.filter((card) => !exclude.includes(card));
    const allCheckedCards = this.allCards.filter((card) => card.checked);
    const includedCheckedCards = included(allCheckedCards);
    const includedDefaultCards = included(this.getDefaultOptions());
    return this.cards.every((card, i) =>
      i < includedCheckedCards.length
        ? includedCheckedCards.includes(card)
        : includedDefaultCards.includes(card)
    );
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
    this._cards = value;
    this.saveCards(value);

    this.name.innerText =
      value.length === 1 ? this.type.name : this.type.namePlural;

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
  }

  initialize() {
    this.initializeData();
    this.initializeLayout();
    this.initializeOptions();
    this.initializeShuffling();
    this.initializeCards();
  }

  initializeData() {
    this.maxSlots = this.parentSection?.maxChildCardCount || 1;
    if (this.parentSection) {
      this.parentSection.childSection = this;
    }

    this.allCards = this.cardsOrSets.flatMap(
      (cardOrSet) => cardOrSet.children || [cardOrSet]
    );

    this.type = this.allCards.reduce((type, card) => {
      const cardType = card.constructor;
      if (type === null || type === cardType) {
        return cardType;
      }
      throw new Error("All cards for a section must be the same type.");
    }, null);

    if (this.parentSection?.minChildCardCount === 0) {
      this.allCards.push(this.type.placeholder);
    }
  }

  initializeLayout() {
    this.root = document.getElementById(this.type.id);
    appendSectionTo(this.root);

    const nameText = this.type.name;
    this.name = this.root.querySelector(".type-name");
    this.name.innerText = nameText;
    const selectText = `Select ${this.type.namePlural}`;
    this.root.querySelector(".select").innerText = selectText;

    const slotsContainer = this.root.querySelector(".slots");
    for (let i = 0; i < this.maxSlots; i++) {
      appendSlotTo(slotsContainer);
    }

    this.slots = Array.from(this.root.querySelectorAll(".slot")).map(
      (element) => new Slot(element)
    );
  }

  initializeOptions() {
    const options = this.root.querySelector(".options");
    const all = new All(this);
    all.appendTo(options);
    this.cardsOrSets.forEach((cardOrSet) => cardOrSet.appendTo(options));
    options.addEventListener("submit", (event) => {
      event.preventDefault();
      toggleSettings();
    });
    if (getItem(this.type.id) === null) {
      this.cardsOrSets[0].checked = true;
    }
  }

  initializeShuffling() {
    this.button = this.root.querySelector("button");
    this.button.addEventListener("click", () => {
      this.shuffle({ preventRepeat: true });
    });
    this.root.addEventListener("transitionend", (event) =>
      this.onTransitionEnd(event)
    );
  }

  initializeCards() {
    this.cards = this.loadCards();
    this.shuffleIfInvalid({ animate: false });
  }

  shuffleIfInvalid({ animate = true } = {}) {
    if (!this.valid && !this.disabled) {
      this.shuffle({ animate });
    }
  }

  shuffle({ animate = true, preventRepeat = false } = {}) {
    const parentSection = this.parentSection;
    const cardCount = parentSection ? parentSection.childCardCount : 1;
    const exclude = parentSection ? [...parentSection.excludedChildCards] : [];
    const newCards = [];

    for (let i = 0; i < cardCount; i++) {
      const oldCard = this.cards[i];
      const preferExclude = preventRepeat ? oldCard : null;
      const newCard = this.randomCard({ exclude, preferExclude });
      newCards.push(newCard);
      exclude.push(newCard);

      if (!animate) {
        continue;
      }

      // Preload new images.
      for (const src of ["frontSrc", "backSrc"]) {
        if (newCard[src] !== oldCard?.[src]) {
          new Image().src = newCard[src];
        }
      }
    }

    if (animate) {
      this.disabled = true;
      this.root.classList.add("flipping");
      this.root.classList.remove("giant");
      this.root.classList.remove("wide");
      this.incomingCards = newCards;
      setTimeout(() => (this.cards = newCards), cardChangeDelayMs);
    } else {
      this.cards = newCards;
    }
  }

  randomCard({ exclude = [], preferExclude = null, available = null } = []) {
    available ||= this.allCards.filter((card) => card.checked);
    available = available.filter((card) => !exclude.includes(card));

    if (preferExclude !== null && available.length > 1) {
      available = available.filter((card) => card !== preferExclude);
    }

    if (available.length === 0) {
      available = this.getDefaultOptions();
      return this.randomCard({ exclude, preferExclude, available });
    }

    return available[Math.floor(Math.random() * available.length)];
  }

  getDefaultOptions() {
    const parentCard = this.parentSection?.primaryCard;
    if (parentCard?.defaultChildCards) {
      return parentCard.defaultChildCards;
    }

    const parentSet = this.cardsOrSets.find(
      (set) => set.name === parentCard?.parent?.name
    );
    if (parentSet) {
      return parentSet.children;
    }

    const coreSet = this.cardsOrSets[0];
    return coreSet.children;
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

    this.childSection?.shuffleIfInvalid();
    maybeReturnFocusAfterShuffle();

    requestPostAnimationFrame(() => this.root.classList.remove("flipped"));
  }

  loadCards() {
    try {
      const savedCardIds = getItem(this.type.id);
      return savedCardIds
        ? savedCardIds
            .map((id) => this.allCards.find((card) => card.id === id))
            .filter((card) => card !== undefined)
        : [];
    } catch {
      clearStorage();
      return [];
    }
  }

  saveCards(cards) {
    const cardIds = cards.map((card) => card.id);
    setItem(this.type.id, cardIds);
  }
}

class Slot {
  constructor(root) {
    this.root = root;
    this.name = root.querySelector(".name");
    this.cardFront = root.querySelector(".front img.front");
    this.cardFrontInner = root.querySelector(".front img.back");
    this.cardBack = root.querySelector(".back img.front");
    this.cardBackInner = root.querySelector(".back img.back");
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
    this.root.classList.toggle("has-giant-form", newCard.hasGiantForm);
    this.root.classList.toggle("has-wide-form", newCard.hasWideForm);
    this.name.innerText = newCard.name;
    this.cardFront.src = newCard.frontSrc;
    if (newCard.backSrc !== oldCard?.backSrc) {
      this.cardBack.src = newCard.backSrc;
    }
    this.cardFrontInner.src = newCard.frontInnerSrc || "";
    this.cardBackInner.src = newCard.backInnerSrc || "";
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
const copySyncUrlButton = document.getElementById("copy-sync-url");
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
  shuffleAllButton.disabled = settingsVisible;
  sections.forEach((section) => (section.button.disabled = settingsVisible));
  if (!settingsVisible) {
    requestPostAnimationFrame(() =>
      sections.forEach((section) => section.shuffleIfInvalid())
    );
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

async function initialize() {
  const overrideUserId = new URL(location.href).searchParams.get("id");
  if (overrideUserId) {
    await setUserId(overrideUserId.toString());
    location.href = location.origin + location.pathname; // Reload page without id override.
    return;
  }

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

  copySyncUrlButton.addEventListener("click", async () => {
    copySyncUrlButton.disabled = true;
    const url = await getSyncUrl();
    const success = copyTextToClipboard(url.toString());
    requestPostAnimationFrame(() => {
      const copyResultMessage = success
        ? "Your unique sync URL has been copied to the clipboard."
        : "Your unique sync URL has been generated, but copying to the" +
          " clipboard failed. You can manually copy it from below.";
      alert(
        copyResultMessage +
          " If you use this URL to open Marvel Shuffle on another device or" +
          " in another browser, your settings and shuffles will be synced."
      );
      copySyncUrlButton.disabled = false;
      copySyncUrlButton.focus();
    });
  });

  await initializeStorage();
  sections.map((section) => section.initialize());

  const heroSection = document.getElementById("hero");
  const heroSlot = heroSection.querySelector(".slot");
  heroSlot.addEventListener("click", () => {
    if (heroSlot.classList.contains("has-giant-form")) {
      heroSection.classList.toggle("giant");
    } else if (heroSlot.classList.contains("has-wide-form")) {
      heroSection.classList.toggle("wide");
    }
  });
}

await initialize();
setTimeout(() => container.classList.remove("init"), 100);
