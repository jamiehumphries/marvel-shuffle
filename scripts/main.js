class Feature {
  constructor(title, hasGenericCardBack, options) {
    this.titleSlug = title;
    this.titleSlug = slug(title);
    this.hasGenericCardBack = hasGenericCardBack;
    this.options = options;
    this.card = document.getElementById(this.titleSlug).querySelector(".card");
    this.button = getButton(this.card);
    this.front = this.card.querySelector("img.front");
    this.back = this.card.querySelector("img.back");

    const storedOption = localStorage.getItem(title);
    if (options.includes(storedOption)) {
      this.current = storedOption;
    } else {
      this.randomizeCurrent();
    }

    this.setImages();
    this.button.addEventListener("click", () => this.shuffle(true));
  }

  get currentSlug() {
    return slug(this.current);
  }

  shuffle(preventRepeat = false) {
    this.randomizeCurrent(preventRepeat);
    this.button.disabled = true;
    toggleShuffleAllButton();
    this.card.classList.add("flipping");
    setTimeout(() => this.setImages(), 300);
  }

  setImages() {
    const newFrontSrc = `images/${this.titleSlug}/${this.currentSlug}/front.png`;
    this.front.src = newFrontSrc;
    if (!this.hasGenericCardBack) {
      const newBackSrc = `images/${this.titleSlug}/${this.currentSlug}/back.png`;
      this.back.src = newBackSrc;
    }
  }

  randomizeCurrent(preventRepeat = false) {
    const currentOptions = preventRepeat ? this.options.filter(o => o !== this.current) : this.options;
    this.current = currentOptions[Math.floor(Math.random() * currentOptions.length)];
    localStorage.setItem(this.titleSlug, this.currentSlug);
  }
}

const shuffleAllButton = document.getElementById("shuffle-all");

const features = [
  new Feature("Villain", true, [
    "Klaw",
    "Rhino",
    "Ultron"
  ]),
  new Feature("Module", true, [
    "Bomb Scare",
    "Legions of Hydra",
    "The Doomsday Chair",
    "The Masters of Evil",
    "Under Attack"
  ]),
  new Feature("Hero", false, [
    "Black Panther",
    "Captain Marvel",
    "Iron Man",
    "She-Hulk",
    "Spider-Man"
  ]),
  new Feature("Aspect", true, [
    "Aggression",
    "Justice",
    "Leadership",
    "Protection"
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
  shuffleAllButton.disabled = features.some(f => f.button.disabled);
}

function slug(text) {
  return text.toLowerCase().replaceAll(/\W/g, "-")
}

for (const card of features.map(f => f.card)) {
  card.addEventListener("transitionend", onTransitionEnd);
}

shuffleAllButton.addEventListener("click", () => {
  for (const feature of features) {
    feature.shuffle();
  }
});
