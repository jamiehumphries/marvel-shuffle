class Feature {
  constructor(name, hasGenericCardBack, options) {
    this.name = name;
    this.hasGenericCardBack = hasGenericCardBack;
    this.options = options;
    this.card = document.getElementById(name).querySelector(".card");
    this.button = getButton(this.card);
    this.front = this.card.querySelector("img.front");
    this.back = this.card.querySelector("img.back");

    const storedOption = localStorage.getItem(name);
    if (options.includes(storedOption)) {
      this.current = storedOption
    } else {
      this.randomizeCurrent();
    }

    this.setImages();
    this.button.addEventListener("click", () => this.roll(true));
  }

  roll(preventRepeat = false) {
    this.randomizeCurrent(preventRepeat);
    this.button.disabled = true;
    toggleRollAllButton();
    this.card.classList.add("flipping");
    setTimeout(() => this.setImages(), 500);
  }

  setImages() {
    const newFrontSrc = `images/${this.name}/${this.current}/front.png`;
    this.front.src = newFrontSrc;
    if (!this.hasGenericCardBack) {
      const newBackSrc = `images/${this.name}/${this.current}/back.png`;
      this.back.src = newBackSrc;
    }
  }

  randomizeCurrent(preventRepeat = false) {
    const currentOptions = preventRepeat ? this.options.filter(o => o !== this.current) : this.options;
    this.current = currentOptions[Math.floor(Math.random() * currentOptions.length)];
    localStorage.setItem(this.name, this.current);
  }
}

const rollAllButton = document.getElementById("roll-all");

const features = [
  new Feature("villain", true, [
    "klaw",
    "rhino",
    "ultron"
  ]),
  new Feature("module", true, [
    "bomb-scare",
    "legions-of-hydra",
    "the-doomsday-chair",
    "the-masters-of-evil",
    "under-attack"
  ]),
  new Feature("hero", false, [
    "black-panther",
    "captain-marvel",
    "iron-man",
    "she-hulk",
    "spider-man"
  ]),
  new Feature("aspect", true, [
    "aggression",
    "justice",
    "leadership",
    "protection"
  ])
];

function onTransitionEnd(event) {
  if (event.propertyName !== "transform") {
    return;
  }
  const card = event.currentTarget;
  card.classList.add("flipped");
  card.classList.remove("flipping");
  setTimeout(() => {
    card.classList.remove("flipped");
    getButton(card).disabled = false;
    toggleRollAllButton();
  }, 0);
}

function getButton(card) {
  return card.parentElement.querySelector("button");
}

function toggleRollAllButton() {
  rollAllButton.disabled = features.some(f => f.button.disabled);
}

for (const card of features.map(f => f.card)) {
  card.addEventListener("transitionend", onTransitionEnd);
}

rollAllButton.addEventListener("click", () => {
  for (const feature of features) {
    feature.roll();
  }
});
