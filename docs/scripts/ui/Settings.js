import { difficulties, extraModulars } from "../data/cards.js";
import { STANDARD } from "../models/Difficulty.js";
import { RadioSetting } from "../models/RadioSetting.js";
import { Setting } from "../models/Setting.js";
import { capitalize } from "../shared/helpers.js";

const PROBABILITY_MAP = {
  never: 0,
  low: 0.05,
  medium: 0.1,
  high: 0.25,
  always: 1,
};

const WEIGHTING_MAP = {
  low: 0.1,
  medium: 0.25,
  high: 0.5,
  even: 1,
  maximum: 10,
};

const preferencesDiv = document.getElementById("preferences");
const customisationDiv = document.getElementById("customisation");
const deckBuildingDiv = document.getElementById("deck-building");

export class Settings {
  constructor({
    maxAllowedHeroes,
    maxAllowedHeroicLevel,
    maxAllowedExtraModulars,
    maxAllowedSuggestedCards,
  }) {
    this.maxAllowedHeroes = maxAllowedHeroes;
    this.maxAllowedHeroicLevel = maxAllowedHeroicLevel;
    this.maxAllowedExtraModulars = maxAllowedExtraModulars;
    this.maxAllowedSuggestedCards = maxAllowedSuggestedCards;
    this.allSectionsInitialized = false;
    this._cardProbabilities = {};
  }

  get numberOfHeroes() {
    return this._numberOfHeroesSetting.value;
  }

  get avoidRepeatedAspects() {
    return this.numberOfHeroes > 1 && this._avoidRepeatedAspects.checked;
  }

  get shuffleDifficulties() {
    return this._shuffleDifficulties.checked;
  }

  get alwaysIncludeExpert() {
    return this.shuffleDifficulties && this._alwaysIncludeExpert.checked;
  }

  get showTracker() {
    return this._showTracker.checked;
  }

  get avoidCompleted() {
    return (
      this.allSectionsInitialized &&
      this.showTracker &&
      this._avoidCompleted.checked
    );
  }

  get maxHeroicLevel() {
    return this._randomiseHeroicLevel.checked
      ? this._maxHeroicLevelSetting.value
      : 0;
  }

  get minExtraModulars() {
    return this._includeAdditionalModulars.checked
      ? this._minExtraModularsSetting.value
      : 0;
  }

  get maxExtraModulars() {
    return this._includeAdditionalModulars.checked
      ? this._maxExtraModularsSetting.value
      : 0;
  }

  get poolAspectWeighting() {
    return this._adjustPoolWeighting.checked
      ? WEIGHTING_MAP[this._poolAspectWeighting]
      : 1;
  }

  get suggestCards() {
    return this._suggestCardsSetting.checked;
  }

  get includeBasicInSuggestedCards() {
    return this.suggestCards && this._includeBasicInSuggestedCards.checked;
  }

  get numberOfSuggestedCards() {
    return this.suggestCards ? this._numberOfSuggestedCardsSetting.value : 0;
  }

  getProbability(card) {
    return this._includeAdditionalModulars.checked
      ? PROBABILITY_MAP[this._cardProbabilities[card.id]]
      : 0;
  }

  initialize() {
    this.initializePreferences();
    this.initializeCustomisation();
    this.initializeDeckBuilding();
  }

  initializePreferences() {
    this.initializeNumberOfHeroes();
    this.initializeNextScenarioButton();
    this.initializeShuffleAndTrackingPrefernces();
    this.initializeDifficultySelection();
  }

  initializeNumberOfHeroes() {
    this._numberOfHeroesSetting = this.initializeNumericalSetting(
      preferencesDiv,
      "number-of-heroes",
      "Number of heroes",
      1,
      this.maxAllowedHeroes,
      (value) => {
        document.body.classList.toggle("has-multiple-heroes", value > 1);
      },
    );

    this._avoidRepeatedAspects = this.initializeCheckboxSetting(
      preferencesDiv,
      "avoid-repeated-aspects",
      "Avoid repeated aspects among heroes",
    );
  }

  initializeNextScenarioButton() {
    this.initializeCheckboxSetting(
      preferencesDiv,
      "show-next-scenario-button",
      "Show “Next Scenario” button",
      { hint: "below campaign scenarios", togglesBodyClass: true },
    );
  }

  initializeShuffleAndTrackingPrefernces() {
    this._shuffleDifficulties = this.initializeCheckboxSetting(
      preferencesDiv,
      "shuffle-difficulties",
      "Shuffle difficulties",
      { togglesBodyClass: true },
    );

    this._alwaysIncludeExpert = this.initializeCheckboxSetting(
      preferencesDiv,
      "always-include-expert",
      "Always include an Expert set",
      { isSubsetting: true },
    );

    this._randomiseHeroicLevel = this.initializeCheckboxSetting(
      preferencesDiv,
      "randomise-heroic-level",
      "Randomise heroic level",
      { isSubsetting: true, togglesBodyClass: true },
    );

    this._showTracker = this.initializeCheckboxSetting(
      preferencesDiv,
      "show-tracker",
      "Show game tracker",
      { hint: "below shuffle", togglesBodyClass: true },
    );

    this._avoidCompleted = this.initializeCheckboxSetting(
      preferencesDiv,
      "avoid-completed",
      "Avoid completed matchups",
      { isSubsetting: true },
    );

    this.initializeCheckboxSetting(
      preferencesDiv,
      "only-show-selected",
      "Only show selected",
      {
        hint: "the full tracker will only show selected scenarios and heroes",
        isSubsetting: true,
      },
    );
  }

  initializeDifficultySelection() {
    const outerDiv = document.createElement("div");
    outerDiv.id = "select-difficulties";
    outerDiv.classList.add("difficulty");
    const containerDiv = document.createElement("div");
    const standardDiv = document.createElement("div");
    const expertDiv = document.createElement("div");
    outerDiv.appendChild(containerDiv);
    containerDiv.appendChild(standardDiv);
    containerDiv.appendChild(expertDiv);

    for (const difficulty of difficulties) {
      const div = difficulty.level === STANDARD ? standardDiv : expertDiv;
      difficulty.appendTo(div);
    }

    preferencesDiv.appendChild(outerDiv);

    this._maxHeroicLevelSetting = this.initializeNumericalSetting(
      preferencesDiv,
      "max-heroic-level",
      "Maximum heroic level",
      0,
      this.maxAllowedHeroicLevel,
    );
  }

  initializeCustomisation() {
    this._includeAdditionalModulars = this.initializeCheckboxSetting(
      customisationDiv,
      "include-additional-modulars",
      "Include more modulars than required",
      { togglesBodyClass: true },
    );

    this.initializeNumberOfExtraModulars();
    this.initializeUncountedModulars();
  }

  initializeNumberOfExtraModulars() {
    this.appendHint(customisationDiv, "extra-modulars");

    this._minExtraModularsSetting = this.initializeNumericalSetting(
      customisationDiv,
      "min-extra-modulars",
      "Minimum extra modulars",
      0,
      this.maxAllowedExtraModulars,
      (value) => {
        if (this._maxExtraModularsSetting && value > this.maxExtraModulars) {
          this._maxExtraModularsSetting.value = value;
        }
      },
    );

    this._maxExtraModularsSetting = this.initializeNumericalSetting(
      customisationDiv,
      "max-extra-modulars",
      "Maximum extra modulars",
      0,
      this.maxAllowedExtraModulars,
      (value) => {
        if (this._minExtraModularsSetting && value < this.minExtraModulars) {
          this._minExtraModularsSetting.value = value;
        }
      },
    );
  }

  initializeUncountedModulars() {
    this.appendHint(customisationDiv, "uncounted-modulars");

    const uncountedModulars = extraModulars.filter((card) => card.isUncounted);
    const options = Object.entries(PROBABILITY_MAP).map(([key, value]) => {
      const html = this.getMapEntryHtml(key, value);
      return { value: key, html };
    });

    for (const card of uncountedModulars) {
      this.initializeRadioSetting(
        customisationDiv,
        `probability--${card.id}`,
        `Probability of adding ${card.name}`,
        options,
        (value) => (this._cardProbabilities[card.id] = value),
      );
    }
  }

  initializeDeckBuilding() {
    this._adjustPoolWeighting = this.initializeCheckboxSetting(
      deckBuildingDiv,
      "adjust-pool-weighting",
      "Adjust likelihood of ‘Pool aspect",
      { hint: "relative to other aspects", togglesBodyClass: true },
    );

    this.initializePoolWeighting();

    this._suggestCardsSetting = this.initializeCheckboxSetting(
      deckBuildingDiv,
      "suggest-cards",
      "Suggest random cards for each hero",
      { hint: "below hero’s aspect section", togglesBodyClass: true },
    );

    this._includeBasicInSuggestedCards = this.initializeCheckboxSetting(
      deckBuildingDiv,
      "include-basic-in-suggested-cards",
      "Include Basic cards in suggestions",
    );

    this.appendHint(deckBuildingDiv, "possible-cards");

    this._numberOfSuggestedCardsSetting = this.initializeNumericalSetting(
      deckBuildingDiv,
      "number-of-suggested-cards",
      "Number of suggested cards",
      0,
      this.maxAllowedSuggestedCards,
    );
  }

  initializePoolWeighting() {
    const options = Object.entries(WEIGHTING_MAP).map(([key, value]) => {
      const html =
        key === "maximum"
          ? this.getMapEntryHtml("Increased", 2) +
            `<div class="deadpool">${this.getMapEntryHtml("Maximum effort!", value)}</div>`
          : this.getMapEntryHtml(key, value);
      return { value: key, html };
    });

    this.appendHint(deckBuildingDiv, "pool-aspect-selected");

    this.initializeRadioSetting(
      deckBuildingDiv,
      "weighting--aspect--pool",
      "Relative weighting of ‘Pool aspect",
      options,
      (value) => (this._poolAspectWeighting = value),
    );
  }

  initializeCheckboxSetting(
    parent,
    slug,
    label,
    { hint = null, isSubsetting = false, togglesBodyClass = false } = {},
  ) {
    const onChange = togglesBodyClass
      ? (checked) => document.body.classList.toggle(slug, checked)
      : null;
    const subname = hint ? `(${hint})` : null;
    const setting = new Setting(slug, label, { subname, onChange });
    const classes = isSubsetting ? ["subsetting"] : [];
    setting.appendTo(parent, ...classes);
    return setting;
  }

  initializeNumericalSetting(parent, slug, legend, min, max, onChange = null) {
    const options = Array.from({ length: max - min + 1 }, (_, i) => {
      const value = min + i;
      return { value, html: value.toString() };
    });
    return this.initializeRadioSetting(parent, slug, legend, options, onChange);
  }

  initializeRadioSetting(parent, slug, legend, options, onChange = null) {
    const radioSetting = new RadioSetting(slug, legend, options, { onChange });
    radioSetting.appendTo(parent);
    return radioSetting;
  }

  getMapEntryHtml(key, value) {
    const label = capitalize(key);
    const sublabel = `${value * 100}%`;
    return `${label}<span>${sublabel}</span>`;
  }

  appendHint(div, hintId) {
    const hint = document.getElementById(hintId);
    div.appendChild(hint);
  }
}
