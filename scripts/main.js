const cardChangeDelayMs = Number(
  getComputedStyle(document.documentElement).getPropertyValue(
    "--card-change-delay-ms"
  )
);

const sectionTemplate = document.getElementById("section");
const optionTemplate = document.getElementById("option");

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
}

class Option {
  get checkbox() {
    return document.getElementById(this.id);
  }

  get checked() {
    return (this._checked ||= localStorage.getItem(this.id) === "true");
  }

  set checked(value) {
    this.setChecked(value, true, true);
  }

  get children() {
    return this._children;
  }

  set children(value) {
    this._children = value;
    value.forEach((child) => (child.parent = this));
  }

  appendTo(element, ...classes) {
    const option = optionTemplate.content.cloneNode(true);

    const label = option.querySelector("label");
    label.htmlFor = this.id;
    classes.forEach((className) => label.classList.add(className));

    const input = option.querySelector("input");
    input.id = this.id;
    input.checked = this.checked;

    const name = option.querySelector(".name");
    name.innerText = this.name;

    element.appendChild(option);

    input.addEventListener("click", (event) => {
      this.checked = event.target.checked;
    });
  }

  setChecked(value, cascadeUp, cascadeDown) {
    this._checked = value;
    localStorage.setItem(this.id, value);
    if (this.checkbox) {
      this.checkbox.checked = value;
    }
    if (this.children && cascadeDown) {
      this.children.forEach((child) => child.setChecked(value, false, true));
    }
    if (this.parent && cascadeUp) {
      const siblings = this.parent.children;
      const allSiblingsChecked = siblings.every((child) => child.checked);
      this.parent.setChecked(allSiblingsChecked, true, false);
    }
  }
}

class All extends Option {
  constructor(section) {
    super();
    this.name = `All ${section.type.namePlural}`;
    this.id = getId(this);
    this.children = section.cardsOrSets;
  }

  appendTo(element) {
    super.appendTo(element, "all");
  }
}

class CardSet extends Option {
  constructor(name, cards) {
    super();
    this.name = name;
    this.id = `${getId(this)}-${cards[0].constructor.id}`;
    this.children = cards;
  }

  appendTo(element) {
    super.appendTo(element, "set");
    this.children.forEach((card) => card.appendTo(element, "set-member"));
  }
}

class Card extends Option {
  static get id() {
    return (this._id ||= getId(this));
  }

  static get namePlural() {
    return (this._name ||= `${this.name}s`);
  }

  constructor(name, { isLandscape = false, hasBack = false } = {}) {
    super();
    const type = this.constructor;
    this.name = name;
    this.id = getId(this);
    this.isLandscape = isLandscape;
    this.frontSrc = `images/${type.id}/${this.id}/front.png`;
    this.backSrc = hasBack
      ? `images/${type.id}/${this.id}/back.png`
      : `images/${type.id}/back.png`;
  }
}

class Scenario extends Card {
  constructor(name, hasBack = false) {
    super(name, { hasBack });
  }
}

class Module extends Card {
  constructor(name, isLandscape = true) {
    super(name, { isLandscape });
  }
}

class Hero extends Card {
  static get namePlural() {
    return "Heroes";
  }

  constructor(name) {
    super(name, { hasBack: true });
  }
}

class Aspect extends Card {
  constructor(name) {
    super(name);
  }
}

const sections = [
  new Section([
    new CardSet("Core Set", [
      new Scenario("Rhino"),
      new Scenario("Klaw"),
      new Scenario("Ultron"),
    ]),
    new CardSet("The Green Goblin", [
      new Scenario("Risky Business", true),
      new Scenario("Mutagen Formula"),
    ]),
    new Scenario("The Wrecking Crew"),
    new CardSet("The Rise of Red Skull", [
      new Scenario("Crossbones"),
      new Scenario("Absorbing Man"),
      new Scenario("Taskmaster"),
      new Scenario("Zola"),
      new Scenario("Red Skull"),
    ]),
  ]),
  new Section([
    new CardSet("Core Set", [
      new Module("Bomb Scare"),
      new Module("The Masters of Evil"),
      new Module("Under Attack"),
      new Module("Legions of Hydra"),
      new Module("The Doomsday Chair"),
    ]),
    new CardSet("The Green Goblin", [
      new Module("Goblin Gimmicks", false),
      new Module("A Mess of Things"),
      new Module("Power Drain"),
      new Module("Running Interference"),
    ]),
    new CardSet("The Rise of Red Skull", [
      new Module("Experimental Weapons", false),
      new Module("Hydra Assault", false),
      new Module("Weapon Master", false),
      new Module("Hydra Patrol"),
    ]),
  ]),
  new Section([
    new CardSet("Core Set", [
      new Hero("Black Panther"),
      new Hero("Captain Marvel"),
      new Hero("Iron Man"),
      new Hero("She-Hulk"),
      new Hero("Spider-Man"),
    ]),
    new Hero("Captain America"),
    new Hero("Ms. Marvel"),
    new Hero("Thor"),
    new Hero("Black Widow"),
    new Hero("Doctor Strange"),
    new Hero("Hulk"),
    new CardSet("The Rise of Red Skull", [
      new Hero("Hawkeye"),
      new Hero("Spider-Woman"),
    ]),
  ]),
  new Section([
    new CardSet("Core Set", [
      new Aspect("Aggression"),
      new Aspect("Justice"),
      new Aspect("Leadership"),
      new Aspect("Protection"),
    ]),
  ]),
];

const container = document.querySelector(".container");
const settingsButton = document.getElementById("settings");
const shuffleAllButton = document.getElementById("shuffle-all");
const shuffleButtons = Array.from(document.getElementsByClassName("shuffle"));
let lastClickedButton = null;

function getId(obj) {
  return obj.name
    .toLowerCase()
    .replaceAll(/\W+/g, "-") // Replace all non-word characters with "-".
    .replaceAll(/(^\-+|\-+$)/g, ""); // Strip any leading and trailing "-".
}

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
