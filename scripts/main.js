// Value must match --card-change-delay in styles/main.css
const CARD_CHANGE_DELAY_MS = 300;

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
      if (!this.elements.button.disabled) {
        this.shuffle(true);
      }
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

    if (newCard.isLandscape) {
      this.elements.slot.classList.add("landscape");
    } else {
      this.elements.slot.classList.remove("landscape");
    }

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
    setShuffleAllButtonAvailability();
  }

  shuffle(preventRepeat = false) {
    const newCard = this.randomCard(preventRepeat);
    this.disabled = true;
    this.elements.slot.classList.add("flipping");
    setTimeout(() => (this.card = newCard), CARD_CHANGE_DELAY_MS);
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
    setTimeout(() => this.elements.slot.classList.remove("flipped"), 0);
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
    const label = document.createElement("label");
    label.htmlFor = this.id;
    label.classList.add("option");
    classes.forEach((className) => label.classList.add(className));

    const input = document.createElement("input");
    input.id = this.id;
    input.type = "checkbox";
    input.checked = this.checked;

    const checkmark = document.createElement("div");
    checkmark.className = "checkmark";

    label.appendChild(input);
    label.appendChild(checkmark);
    label.append(this.name);
    element.appendChild(label);

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
  constructor(name, { hasBack = false } = {}) {
    super(name, { hasBack });
  }
}

class Module extends Card {}

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
    new Scenario("Risky Business", { hasBack: true }),
  ]),
  new Section([
    new CardSet("Core Set", [
      new Module("Bomb Scare", { isLandscape: true }),
      new Module("Legions of Hydra", { isLandscape: true }),
      new Module("Under Attack", { isLandscape: true }),
      new Module("The Masters of Evil", { isLandscape: true }),
      new Module("The Doomsday Chair", { isLandscape: true }),
    ]),
    new Module("Goblin Gimmicks"),
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
const shuffleAllButton = document.getElementById("shuffle-all");
let lastClickedButton = null;

function getId(obj) {
  return obj.name.toLowerCase().replaceAll(/\W/g, "-");
}

function setShuffleAllButtonAvailability() {
  shuffleAllButton.disabled = sections.some((section) => section.disabled);
}

function maybeReturnFocusAfterShuffle() {
  if (lastClickedButton && !lastClickedButton.disabled) {
    lastClickedButton.focus();
  }
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

shuffleAllButton.addEventListener("click", () =>
  sections.forEach((section) => section.shuffle())
);

setTimeout(() => container.classList.remove("init"), 100);
