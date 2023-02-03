class Slot {
  constructor(cards) {
    this.cards = cards;
    this.typeId = this.cards.reduce((typeId, card) => {
      const cardTypeId = getId(card.constructor);
      if (typeId == null || typeId == cardTypeId) {
        return cardTypeId;
      }
      throw new Error("All cards in a slot must be the same type.");
    }, null);

    const container = document.getElementById(this.typeId);
    this.shuffleButton = container.querySelector("button");
    this.nameElement = container.querySelector(".name");
    this.cardElement = container.querySelector(".card");
    this.frontImg = this.cardElement.querySelector("img.front");
    this.backImg = this.cardElement.querySelector("img.back");

    const savedCardId = localStorage.getItem(this.typeId);
    const savedCard = this.cards.find((card) => card.id === savedCardId);
    this.card = savedCard || this.randomCard();

    this.shuffleButton.addEventListener("click", () => this.shuffle(true));
    this.cardElement.addEventListener("transitionend", (event) =>
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

    this.nameElement.innerText = newCard.name;
    this.frontImg.src = newCard.frontSrc;
    if (newCard.backSrc !== oldCard?.backSrc) {
      this.backImg.src = newCard.backSrc;
    }

    this._card = value;
    localStorage.setItem(this.typeId, value.id);
  }

  get disabled() {
    return this.shuffleButton.disabled;
  }

  set disabled(value) {
    this.shuffleButton.disabled = value;
    setShuffleAllButtonAvailability();
  }

  shuffle(preventRepeat = false) {
    const newCard = this.randomCard(preventRepeat);
    this.disabled = true;
    this.cardElement.classList.add("flipping");
    setTimeout(() => (this.card = newCard), 300);
  }

  onTransitionEnd(event) {
    if (event.propertyName !== "transform") {
      return;
    }
    this.cardElement.classList.remove("flipping");
    this.cardElement.classList.add("flipped");
    this.disabled = false;
    setTimeout(() => this.cardElement.classList.remove("flipped"), 0);
  }

  randomCard(preventRepeat = false) {
    const availableCards = preventRepeat
      ? this.cards.filter((card) => card !== this.card)
      : this.cards;
    return availableCards[Math.floor(Math.random() * availableCards.length)];
  }
}

class Card {
  constructor(name, hasBack) {
    const typeId = getId(this.constructor);
    this.name = name;
    this.id = getId(this);
    this.frontSrc = `images/${typeId}/${this.id}/front.png`;
    this.backSrc = hasBack
      ? `images/${typeId}/${this.id}/back.png`
      : `images/${typeId}/back.png`;
  }
}

class Scenario extends Card {
  constructor(name, hasBack = false) {
    super(name, hasBack);
  }
}

class Module extends Card {
  constructor(name) {
    super(name, false);
  }
}

class Hero extends Card {
  constructor(name) {
    super(name, true);
  }
}

class Aspect extends Card {
  constructor(name) {
    super(name, false);
  }
}

const slots = [
  new Slot([
    new Scenario("Klaw"),
    new Scenario("Risky Business", true),
    new Scenario("Rhino"),
    new Scenario("Ultron"),
  ]),
  new Slot([
    new Module("Bomb Scare"),
    new Module("Legions of Hydra"),
    new Module("The Doomsday Chair"),
    new Module("The Masters of Evil"),
    new Module("Under Attack"),
  ]),
  new Slot([
    new Hero("Black Panther"),
    new Hero("Captain Marvel"),
    new Hero("Iron Man"),
    new Hero("She-Hulk"),
    new Hero("Spider-Man"),
  ]),
  new Slot([
    new Aspect("Aggression"),
    new Aspect("Justice"),
    new Aspect("Leadership"),
    new Aspect("Protection"),
  ]),
];

const shuffleAllButton = document.getElementById("shuffle-all");

shuffleAllButton.addEventListener("click", () =>
  slots.forEach((slot) => slot.shuffle())
);

function getId(obj) {
  return obj.name.toLowerCase().replaceAll(/\W/g, "-");
}

function setShuffleAllButtonAvailability() {
  shuffleAllButton.disabled = slots.some((slot) => slot.disabled);
}
