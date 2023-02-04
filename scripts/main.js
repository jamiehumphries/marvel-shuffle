class Section {
  constructor(cards) {
    this.cards = cards;
    this.typeId = this.cards.reduce((typeId, card) => {
      const cardTypeId = getId(card.constructor);
      if (typeId == null || typeId == cardTypeId) {
        return cardTypeId;
      }
      throw new Error("All cards for a section must be the same type.");
    }, null);

    const container = document.getElementById(this.typeId);
    this.elements = {
      button: container.querySelector("button"),
      name: container.querySelector(".name"),
      slot: container.querySelector(".slot"),
      cardFront: container.querySelector("img.front"),
      cardBack: container.querySelector("img.back"),
    };
  }

  initialize() {
    const savedCardId = localStorage.getItem(this.typeId);
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
    localStorage.setItem(this.typeId, value.id);
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
    setTimeout(() => (this.card = newCard), 300);
  }

  onTransitionEnd(event) {
    const { propertyName, target } = event;
    if (propertyName !== "transform" || target !== this.elements.slot) {
      return;
    }
    this.elements.slot.classList.remove("flipping");
    this.elements.slot.classList.add("flipped");
    this.disabled = false;
    setTimeout(() => this.elements.slot.classList.remove("flipped"), 0);
  }

  randomCard(preventRepeat = false) {
    const availableCards = preventRepeat
      ? this.cards.filter((card) => card !== this.card)
      : this.cards;
    return availableCards[Math.floor(Math.random() * availableCards.length)];
  }
}

class Card {
  constructor(name, { isLandscape = false, hasBack = false } = {}) {
    const typeId = getId(this.constructor);
    this.name = name;
    this.id = getId(this);
    this.isLandscape = isLandscape;
    this.frontSrc = `images/${typeId}/${this.id}/front.png`;
    this.backSrc = hasBack
      ? `images/${typeId}/${this.id}/back.png`
      : `images/${typeId}/back.png`;
  }
}

class Scenario extends Card {
  constructor(name, { hasBack = false } = {}) {
    super(name, { hasBack });
  }
}

class Module extends Card {}

class Hero extends Card {
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
    new Scenario("Klaw"),
    new Scenario("Risky Business", { hasBack: true }),
    new Scenario("Rhino"),
    new Scenario("Ultron"),
  ]),
  new Section([
    new Module("Bomb Scare", { isLandscape: true }),
    new Module("Goblin Gimmicks"),
    new Module("Legions of Hydra", { isLandscape: true }),
    new Module("The Doomsday Chair", { isLandscape: true }),
    new Module("The Masters of Evil", { isLandscape: true }),
    new Module("Under Attack", { isLandscape: true }),
  ]),
  new Section([
    new Hero("Black Panther"),
    new Hero("Captain Marvel"),
    new Hero("Iron Man"),
    new Hero("She-Hulk"),
    new Hero("Spider-Man"),
  ]),
  new Section([
    new Aspect("Aggression"),
    new Aspect("Justice"),
    new Aspect("Leadership"),
    new Aspect("Protection"),
  ]),
];

const container = document.querySelector(".container");
const shuffleAllButton = document.getElementById("shuffle-all");

function getId(obj) {
  return obj.name.toLowerCase().replaceAll(/\W/g, "-");
}

function setShuffleAllButtonAvailability() {
  shuffleAllButton.disabled = sections.some((section) => section.disabled);
}

// Initialisation steps.

shuffleAllButton.addEventListener("click", () =>
  sections.forEach((section) => section.shuffle())
);

sections.forEach((section) => section.initialize());

setTimeout(() => container.classList.remove("init"), 100);
