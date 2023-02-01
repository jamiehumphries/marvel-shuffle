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
    this.button.addEventListener("click", () => this.shuffle(true));
  }

  shuffle(preventRepeat = false) {
    this.randomizeCurrent(preventRepeat);
    this.button.disabled = true;
    toggleShuffleAllButton();
    this.card.classList.add("flipping");
    setTimeout(() => this.setImages(), 300);
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

const shuffleAll = document.getElementById("shuffle-all");

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
    toggleShuffleAllButton();
  }, 0);
}

function getButton(card) {
  return card.parentElement.querySelector("button");
}

function toggleShuffleAllButton() {
  shuffleAll.disabled = features.some(f => f.button.disabled);
}

for (const card of features.map(f => f.card)) {
  card.addEventListener("transitionend", onTransitionEnd);
}

shuffleAll.addEventListener("click", () => {
  for (const feature of features) {
    feature.shuffle();
  }
});
