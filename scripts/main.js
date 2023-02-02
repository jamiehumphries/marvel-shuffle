class Feature {
  constructor(title, hasSharedBack, options) {
    this.title = title;
    this.titleSlug = Feature.slug(title);
    this.hasSharedBack = hasSharedBack;
    this.options = options;
    this.card = document.getElementById(this.titleSlug).querySelector(".card");
    this.button = this.card.parentElement.querySelector("button");
    this.front = this.card.querySelector("img.front");
    this.back = this.card.querySelector("img.back");

    const storedOption = localStorage.getItem(this.title);
    if (this.options.includes(storedOption)) {
      this.current = storedOption;
    } else {
      this.randomizeCurrent();
    }

    this.setImages();
    this.button.addEventListener("click", () => this.shuffle(true));
    this.card.addEventListener("transitionend", (e) => this.onTransitionEnd(e));
  }

  get currentSlug() {
    return Feature.slug(this.current);
  }

  shuffle(preventRepeat = false) {
    this.randomizeCurrent(preventRepeat);
    this.button.disabled = true;
    toggleShuffleAllButton();
    this.card.classList.add("flipping");
    setTimeout(() => this.setImages(), 300);
  }

  setImages() {
    const folder = `images/${this.titleSlug}/${this.currentSlug}`;
    this.front.src = `${folder}/front.png`;
    if (!this.hasSharedBack) {
      this.back.src = `${folder}/back.png`;
    }
  }

  randomizeCurrent(preventRepeat = false) {
    const currentOptions = preventRepeat
      ? this.options.filter((o) => o !== this.current)
      : this.options;
    this.current = Feature.chooseRandom(currentOptions);
    localStorage.setItem(this.title, this.current);
  }

  onTransitionEnd(event) {
    if (event.propertyName !== "transform") {
      return;
    }
    this.card.classList.add("flipped");
    this.card.classList.remove("flipping");
    this.button.disabled = false;
    toggleShuffleAllButton();
    setTimeout(() => this.card.classList.remove("flipped"), 0);
  }

  static slug(text) {
    return text.toLowerCase().replaceAll(/\W/g, "-");
  }

  static chooseRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
}

const features = [
  new Feature("Villain", true, ["Klaw", "Rhino", "Ultron"]),
  new Feature("Module", true, [
    "Bomb Scare",
    "Legions of Hydra",
    "The Doomsday Chair",
    "The Masters of Evil",
    "Under Attack",
  ]),
  new Feature("Hero", false, [
    "Black Panther",
    "Captain Marvel",
    "Iron Man",
    "She-Hulk",
    "Spider-Man",
  ]),
  new Feature("Aspect", true, [
    "Aggression",
    "Justice",
    "Leadership",
    "Protection",
  ]),
];

const shuffleAllButton = document.getElementById("shuffle-all");

function toggleShuffleAllButton() {
  shuffleAllButton.disabled = features.some((f) => f.button.disabled);
}

shuffleAllButton.addEventListener("click", () => {
  for (const feature of features) {
    feature.shuffle();
  }
});
