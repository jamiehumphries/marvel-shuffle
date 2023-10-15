import copyTextToClipboard from "./lib/copy-text-to-clipboard.js";
import { Setting, All } from "./options.js?v=2.0.3";
import {
  scenarios,
  modules,
  heroes,
  aspects,
  flatten,
} from "./cards.js?v=2.0.3";
import {
  initializeStorage,
  clearStorage,
  getBookmarkUrl,
  setUserId,
  getItem,
  setItem,
} from "./storage.js?v=2.0.3";
import {
  clearTable,
  renderTable,
  initializeDifficultySettings,
  getTrackedDifficulties,
  isGameCompleted,
} from "./tracker.js?v=2.0.3";

const cardChangeDelayMs = Number(
  getComputedStyle(document.documentElement)
    .getPropertyValue("--card-change-delay")
    .slice(0, -1 * "ms".length),
);

class Toggleable {
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

class Section extends Toggleable {
  constructor(
    cardsOrSets,
    nthOfType,
    { previousSiblingSection = null, parentSection = null } = {},
  ) {
    super();
    this.cardsOrSets = cardsOrSets;
    this.nthOfType = nthOfType;
    this.previousSiblingSection = previousSiblingSection;
    this.parentSection = parentSection;

    this.maxSlots = this.parentSection?.maxChildCardCount || 1;

    if (this.parentSection) {
      this.parentSection.childSection = this;
    }

    this.previousSiblingSections = [];
    this.allSiblingSections = [];
    if (this.previousSiblingSection) {
      this.previousSiblingSections.push(
        this.previousSiblingSection,
        ...this.previousSiblingSection.previousSiblingSections,
      );
      this.allSiblingSections.push(
        this.previousSiblingSection,
        ...this.previousSiblingSection.allSiblingSections,
      );
      this.allSiblingSections.forEach((siblingSection) =>
        siblingSection.allSiblingSections.push(this),
      );
    }

    this.allCards = flatten(this.cardsOrSets);

    this.type = this.allCards.reduce((type, card) => {
      const cardType = card.type;
      if (type === null || type === cardType) {
        return cardType;
      }
      throw new Error("All cards for a section must be the same type.");
    }, null);

    this.id = this.type.id;
    if (this.nthOfType !== 1) {
      this.id += `-${this.nthOfType}`;
    }

    this.root = document.getElementById(this.id);
  }

  get maxChildCardCount() {
    return Math.max(...this.allCards.map((card) => card.childCardCount));
  }

  get trueCard() {
    return this.maxSlots === 1 ? (this.incomingCards || this.cards)[0] : null;
  }

  get childCardCount() {
    return this.trueCard?.childCardCount || 0;
  }

  get excludedChildCards() {
    return this.trueCard?.excludedChildCards || [];
  }

  get defaultChildCards() {
    return this.trueCard?.defaultChildCards;
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
        : includedDefaultCards.includes(card),
    );
  }

  get visible() {
    return !this.root.classList.contains("hidden");
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

    updateTrackingTable();
  }

  initialize() {
    this.initializeLayout();
    this.initializeOptions();
    this.initializeShuffling();
    this.initializeCards();
  }

  initializeLayout() {
    const sectionTemplate = document.getElementById("section");
    const element = sectionTemplate.content.cloneNode(true);
    this.root.appendChild(element);

    const nameText = this.type.name;
    this.name = this.root.querySelector(".type-name");
    this.name.innerText = nameText;
    const selectText = `Select ${this.type.namePlural}`;
    this.root.querySelector(".select").innerText = selectText;

    const slotsContainer = this.root.querySelector(".slots");
    const slotTemplate = document.getElementById("slot");
    for (let i = 0; i < this.maxSlots; i++) {
      const element = slotTemplate.content.firstElementChild.cloneNode(true);
      slotsContainer.appendChild(element);
    }

    this.slots = Array.from(this.root.querySelectorAll(".slot")).map(
      (element) => new Slot(element),
    );
  }

  initializeOptions() {
    if (this.nthOfType !== 1) {
      return;
    }

    const options = this.root.querySelector(".options");

    const optionsHint = document.createElement("p");
    optionsHint.classList.add("options-hint");
    optionsHint.innerText = `If no ${this.type.namePlural} are selected, `;
    optionsHint.innerText += this.parentSection
      ? `the ${this.parentSection.type.name} default(s) will be used`
      : `the Core Set ${this.type.namePlural} will be used`;
    options.appendChild(optionsHint);

    const all = new All(this);
    all.appendTo(options);
    this.cardsOrSets.forEach((cardOrSet) => cardOrSet.appendTo(options));
    options.addEventListener("submit", (event) => {
      event.preventDefault();
      toggleSettings();
    });

    if (getItem(this.id) === null) {
      this.cardsOrSets[0].checked = true;
    }
  }

  initializeShuffling() {
    this.button = this.root.querySelector("button");
    this.button.addEventListener("click", () => {
      this.shuffle({ isShuffleAll: false });
    });
    this.root.addEventListener("transitionend", (event) =>
      this.onTransitionEnd(event),
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

  shuffle({ animate = true, isShuffleAll = false, preferUse = null } = {}) {
    const parentSection = this.parentSection;
    const exclusiveSiblingSections = isShuffleAll
      ? this.previousSiblingSections
      : this.allSiblingSections;
    const cardCount = parentSection ? parentSection.childCardCount : 1;
    const exclude = parentSection
      ? [...parentSection.excludedChildCards]
      : exclusiveSiblingSections.flatMap((section) => section.trueCard);

    const newCards = [];

    for (let i = 0; i < cardCount; i++) {
      const oldCard = this.cards[i];
      const preferExclude = !isShuffleAll ? oldCard : null;
      const newCard = this.randomCard({ exclude, preferExclude, preferUse });
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
      document.body.classList.add("shuffling");
      this.root.classList.add("flipping");
      this.root.classList.remove("giant");
      this.root.classList.remove("wide");
      this.incomingCards = newCards;
      setTimeout(() => (this.cards = newCards), cardChangeDelayMs);
    } else {
      this.cards = newCards;
    }
  }

  randomCard({
    exclude = [],
    preferUse = null,
    preferExclude = null,
    available = null,
  } = {}) {
    available ||= this.allCards.filter((card) => card.checked);
    available = available.filter((card) => !exclude.includes(card));

    if (preferUse && available.includes(preferUse)) {
      return preferUse;
    }

    if (preferExclude !== null && available.length > 1) {
      available = available.filter((card) => card !== preferExclude);
    }

    if (available.length === 0) {
      available = this.getDefaultOptions();
      return this.randomCard({ exclude, preferUse, preferExclude, available });
    }

    return chooseRandom(available);
  }

  getDefaultOptions() {
    const parentCard = this.parentSection?.trueCard;
    if (parentCard?.defaultChildCards) {
      return parentCard.defaultChildCards;
    }

    const parentSet = this.cardsOrSets.find(
      (set) => set.name === parentCard?.parent?.name,
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

    document.body.classList.remove("shuffling");
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
      const savedCardIds = getItem(this.id);
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
    setItem(this.id, cardIds);
  }
}

class ScenarioSection extends Section {
  shuffle({ animate = true, isShuffleAll = false, preferUse = null } = {}) {
    const currentHero = heroSection1.trueCard;
    if (!preferUse && currentHero && settings.avoidCompleted) {
      const { scenario } = randomGame({ availableHeroes: [currentHero] });
      preferUse = scenario;
    }
    super.shuffle({ animate, isShuffleAll, preferUse });
  }
}

class ModuleSection extends Section {}

class HeroSection extends Section {
  shuffle({ animate = true, isShuffleAll = false, preferUse = null } = {}) {
    const currentScenario = scenarioSection.trueCard;
    if (!preferUse && currentScenario && settings.avoidCompleted) {
      const { hero } = randomGame({ availableScenarios: [currentScenario] });
      preferUse = hero;
    }
    super.shuffle({ animate, isShuffleAll, preferUse });
  }
}

class AspectSection extends Section {}

class Slot extends Toggleable {
  constructor(root) {
    super();
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
}

class Settings {
  get avoidCompleted() {
    return this.showTracker && this._avoidCompletedSetting.checked;
  }

  get showTracker() {
    return this._showTrackerSetting.checked;
  }

  get anyDifficultiesTracked() {
    return this._difficultSettings.some((setting) => setting.checked);
  }

  initialize() {
    this.initializeNumberOfHeroes();
    this.initializeTrackerSettings();
  }

  initializeNumberOfHeroes() {
    const id = "setting--number-of-heroes";
    const fieldset = document.getElementById(id);
    const radios = fieldset.querySelectorAll("input");

    const values = [...radios].map((radio) => Number(radio.value));

    this.numberOfHeroes = getItem(id);
    if (!values.includes(this.numberOfHeroes)) {
      this.numberOfHeroes = values[0];
    }

    const toggleHeroSectionVisibility = () => {
      for (let i = 0; i < heroSections.length; i++) {
        const heroSection = heroSections[i];
        heroSection.toggleVisibility(i < this.numberOfHeroes);
      }
    };

    const onChange = (event) => {
      const value = Number(event.target.value);
      this.numberOfHeroes = value;
      setItem(id, value);
      toggleHeroSectionVisibility();
    };

    radios.forEach((radio) => {
      radio.checked = radio.value === this.numberOfHeroes.toString();
      radio.addEventListener("change", onChange);
    });

    toggleHeroSectionVisibility();
  }

  initializeTrackerSettings() {
    const preferencesElement = document.getElementById("preferences");

    this._showTrackerSetting = new Setting(
      "show-tracker",
      "Show game tracker under shuffle",
      {
        onChange: (checked) =>
          container.classList.toggle("show-tracker", checked),
      },
    );

    this._difficultSettings = initializeDifficultySettings();

    this._avoidCompletedSetting = new Setting(
      "avoid-completed",
      "Avoid completed games when shuffling",
    );

    const settings = [
      this._showTrackerSetting,
      ...this._difficultSettings,
      this._avoidCompletedSetting,
    ];

    settings.forEach((setting) => setting.appendTo(preferencesElement));
  }
}

const container = document.querySelector(".container");
const settingsButton = document.getElementById("settings");
const shuffleAllButton = document.getElementById("shuffle-all");
const copyBookmarkUrlButton = document.getElementById("copy-bookmark-url");
let lastClickedButton = null;

const settings = new Settings();

const scenarioSection = new ScenarioSection(scenarios, 1);
const moduleSection = new ModuleSection(modules, 1, {
  parentSection: scenarioSection,
});
const heroSection1 = new HeroSection(heroes, 1);
const aspectSection1 = new AspectSection(aspects, 1, {
  parentSection: heroSection1,
});
const heroSection2 = new HeroSection(heroes, 2, {
  previousSiblingSection: heroSection1,
});
const aspectSection2 = new AspectSection(aspects, 2, {
  parentSection: heroSection2,
});
const heroSection3 = new HeroSection(heroes, 3, {
  previousSiblingSection: heroSection2,
});
const aspectSection3 = new AspectSection(aspects, 3, {
  parentSection: heroSection3,
});
const heroSection4 = new HeroSection(heroes, 4, {
  previousSiblingSection: heroSection3,
});
const aspectSection4 = new AspectSection(aspects, 4, {
  parentSection: heroSection4,
});

const sections = [
  scenarioSection,
  moduleSection,
  heroSection1,
  aspectSection1,
  heroSection2,
  aspectSection2,
  heroSection3,
  aspectSection3,
  heroSection4,
  aspectSection4,
];

const heroSections = sections.filter(
  (section) => section.constructor === HeroSection,
);

function getVisibleHeroSections() {
  return heroSections.filter((section) => section.visible);
}

function shuffleAll() {
  const { scenario, hero } = randomGame();
  scenarioSection.shuffle({ isShuffleAll: true, preferUse: scenario });
  heroSection1.shuffle({ isShuffleAll: true, preferUse: hero });
  for (const section of sections) {
    if ([scenarioSection, heroSection1].includes(section)) {
      continue;
    }
    section.shuffle({ isShuffleAll: true });
  }
}

function randomGame({
  availableScenarios = null,
  availableHeroes = null,
} = {}) {
  const available = (section) => {
    const allCheckedCards = section.allCards.filter((card) => card.checked);
    return allCheckedCards.length > 0
      ? allCheckedCards
      : section.getDefaultOptions();
  };

  availableScenarios ||= available(scenarioSection);
  availableHeroes ||= available(heroSection1);

  const trackedDifficulties = getTrackedDifficulties();

  let availableGames = availableScenarios.flatMap((scenario) =>
    availableHeroes.flatMap((hero) =>
      trackedDifficulties.map((difficulty) => {
        return { scenario, hero, difficulty };
      }),
    ),
  );

  if (settings.avoidCompleted) {
    const uncompletedAvailableGames = availableGames.filter((game) => {
      const { scenario, hero, difficulty } = game;
      return !isGameCompleted(scenario, hero, difficulty);
    });

    if (uncompletedAvailableGames.length > 0) {
      availableGames = uncompletedAvailableGames;
    }
  }

  const newAvailableGames = availableGames.filter(({ scenario, hero }) => {
    const isNewScenario = scenario !== scenarioSection.trueCard;
    const isNewHero = hero !== heroSection1.trueCard;
    return isNewScenario || isNewHero;
  });

  if (newAvailableGames.length > 0) {
    availableGames = newAvailableGames;
  }

  return chooseRandom(availableGames);
}

function toggleSettings() {
  const settingsVisible = container.classList.toggle("show-settings");
  shuffleAllButton.disabled = settingsVisible;
  sections.forEach((section) => (section.button.disabled = settingsVisible));
  if (!settingsVisible) {
    requestPostAnimationFrame(() =>
      sections.forEach((section) => section.shuffleIfInvalid()),
    );
    updateTrackingTable();
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

function updateTrackingTable() {
  const scenariosReady = scenarioSection.cards.length > 0;

  const visibleHeroSections = getVisibleHeroSections();
  const heroesReady = visibleHeroSections.every(
    (section) => section.cards.length > 0,
  );

  if (!scenariosReady || !heroesReady) {
    return;
  }

  if (settings.anyDifficultiesTracked) {
    const scenarioSet = { children: scenarioSection.cards };
    const heroSet = {
      children: visibleHeroSections.flatMap((section) => section.cards),
    };
    renderTable([scenarioSet], [heroSet]);
  } else {
    clearTable();
  }
}

function requestPostAnimationFrame(callback) {
  requestAnimationFrame(() => {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = callback;
    port2.postMessage(undefined);
  });
}

function chooseRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function initialize() {
  const overrideUserId = new URL(location.href).searchParams.get("id");
  if (overrideUserId) {
    await setUserId(overrideUserId.toString());
    location.href = location.origin + location.pathname; // Reload page without id override.
    return;
  }

  window.addEventListener("keydown", () => {
    lastClickedButton = null;
  });

  window.addEventListener("mousedown", () => {
    lastClickedButton = null;
  });

  window.addEventListener("click", (event) => {
    lastClickedButton = event.target.tagName === "BUTTON" ? event.target : null;
  });

  shuffleAllButton.addEventListener("click", () => shuffleAll());
  settingsButton.addEventListener("click", () => toggleSettings());

  copyBookmarkUrlButton.addEventListener("click", async () => {
    copyBookmarkUrlButton.disabled = true;
    const url = await getBookmarkUrl();
    const success = copyTextToClipboard(url.toString());
    requestPostAnimationFrame(() => {
      const copyResultMessage = success
        ? "Your bookmark URL has been copied to the clipboard."
        : "Your bookmark URL has been generated, but copying to the" +
          " clipboard failed. You can manually copy it from below.";
      alert(copyResultMessage);
      copyBookmarkUrlButton.disabled = false;
      copyBookmarkUrlButton.focus();
    });
  });

  await initializeStorage();
  settings.initialize();
  sections.map((section) => section.initialize());

  for (const heroSection of heroSections) {
    const heroSlot = heroSection.slots[0];
    const sectionClassList = heroSection.root.classList;
    const slotClassList = heroSlot.root.classList;
    heroSlot.root.addEventListener("click", () => {
      if (sectionClassList.contains("flipping")) {
        return;
      }
      if (slotClassList.contains("has-giant-form")) {
        sectionClassList.toggle("giant");
      } else if (slotClassList.contains("has-wide-form")) {
        sectionClassList.toggle("wide");
      }
    });
  }
}

await initialize();
setTimeout(() => container.classList.remove("init"), 100);
