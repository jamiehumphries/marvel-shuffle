import { difficulties, extraModulars } from "../data/cards.js?v=9a2e587a";
import { getItem, setItem } from "../data/storage.js?v=e77ff9b5";
import { STANDARD } from "../models/Difficulty.js?v=31e5b092";
import { Setting } from "../models/Setting.js?v=225e44df";

const PROBABILITY_MAP = {
  never: 0,
  low: 0.05,
  medium: 0.1,
  high: 0.25,
  always: 1,
};

const preferencesDiv = document.getElementById("preferences");
const customisationDiv = document.getElementById("customisation");
const deckBuildingDiv = document.getElementById("deck-building");

export class Settings {
  constructor({
    maxNumberOfHeroes,
    maxAllowedHeroicLevel,
    maxNumberOfExtraModulars,
    maxNumberOfSuggestedCards,
  }) {
    this.maxNumberOfHeroes = maxNumberOfHeroes;
    this.maxAllowedHeroicLevel = maxAllowedHeroicLevel;
    this.maxNumberOfExtraModulars = maxNumberOfExtraModulars;
    this.maxNumberOfSuggestedCards = maxNumberOfSuggestedCards;
    this.allSectionsInitialized = false;
    this._cardProbabilities = {};
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
    return this._randomiseHeroicLevel.checked ? this._maxHeroicLevel : 0;
  }

  get numberOfExtraModulars() {
    return this._includeAdditionalModulars.checked
      ? this._numberOfExtraModulars
      : 0;
  }

  get suggestCards() {
    return this._suggestCards.checked;
  }

  get includeBasicInSuggestedCards() {
    return this.suggestCards && this._includeBasicInSuggestedCards.checked;
  }

  get numberOfSuggestedCards() {
    return this.suggestCards ? this._numberOfSuggestedCards : 0;
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
    this.initializeNumericalSetting(
      preferencesDiv,
      "number-of-heroes",
      "Number of heroes",
      1,
      this.maxNumberOfHeroes,
      (value) => (this.numberOfHeroes = value),
    );
  }

  initializeNextScenarioButton() {
    this.initializeCheckboxSetting(
      preferencesDiv,
      "show-next-scenario-button",
      "Show “Next Scenario” button",
      { subname: "(below campaign scenarios)", togglesBodyClass: true },
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
      { subname: "(below shuffle)", togglesBodyClass: true },
    );
    this._avoidCompleted = this.initializeCheckboxSetting(
      preferencesDiv,
      "avoid-completed",
      "Avoid completed matchups",
      { isSubsetting: true },
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

    this.initializeNumericalSetting(
      preferencesDiv,
      "max-heroic-level",
      "Maximum heroic level",
      0,
      this.maxAllowedHeroicLevel,
      (value) => (this._maxHeroicLevel = value),
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

    this.initializeNumericalSetting(
      customisationDiv,
      "number-of-extra-modulars",
      "Extra modulars",
      0,
      this.maxNumberOfExtraModulars,
      (value) => (this._numberOfExtraModulars = value),
    );
  }

  initializeUncountedModulars() {
    this.appendHint(customisationDiv, "uncounted-modulars");

    const uncountedModulars = extraModulars.filter((card) => card.isUncounted);
    const options = Object.entries(PROBABILITY_MAP).map(
      ([key, probability]) => {
        const label = key[0].toUpperCase() + key.slice(1);
        const sublabel = `${probability * 100}%`;
        return { value: key, html: `${label}<span>${sublabel}</span>` };
      },
    );

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
    this._suggestCards = this.initializeCheckboxSetting(
      deckBuildingDiv,
      "suggest-cards",
      "Suggest random cards for each hero",
      { subname: "(below hero’s aspect section)", togglesBodyClass: true },
    );
    this._includeBasicInSuggestedCards = this.initializeCheckboxSetting(
      deckBuildingDiv,
      "include-basic-in-suggested-cards",
      "Include Basic cards in suggestions",
    );
    this.appendHint(deckBuildingDiv, "possible-cards");
    this.initializeNumericalSetting(
      deckBuildingDiv,
      "number-of-suggested-cards",
      "Number of suggested cards",
      0,
      this.maxNumberOfSuggestedCards,
      (value) => (this._numberOfSuggestedCards = value),
    );
  }

  initializeCheckboxSetting(
    parent,
    slug,
    label,
    { subname = null, isSubsetting = false, togglesBodyClass = false } = {},
  ) {
    const onChange = togglesBodyClass
      ? (checked) => document.body.classList.toggle(slug, checked)
      : null;
    const setting = new Setting(slug, label, { subname, onChange });
    const classes = isSubsetting ? ["subsetting"] : [];
    setting.appendTo(parent, ...classes);
    return setting;
  }

  initializeNumericalSetting(parent, setting, legend, min, max, setValue) {
    const options = Array.from({ length: max - min + 1 }, (_, i) => {
      const value = min + i;
      return { value, html: value.toString() };
    });
    this.initializeRadioSetting(parent, setting, legend, options, setValue);
  }

  initializeRadioSetting(parent, setting, legend, options, setValue) {
    const id = `setting--${setting}`;

    const allowedValues = options.map((option) => option.value);
    const storedValue = getItem(id);
    const initialValue = allowedValues.includes(storedValue)
      ? storedValue
      : allowedValues[0];
    setValue(initialValue);

    const isNumerical = allowedValues.every((value) => !isNaN(value));

    const fieldset = document.createElement("fieldset");
    fieldset.id = id;
    fieldset.classList.add("radio-setting");
    if (isNumerical) {
      fieldset.classList.add("numerical-setting");
    }

    const fieldsetLegend = document.createElement("legend");
    fieldsetLegend.innerText = legend;
    fieldset.appendChild(fieldsetLegend);

    const onChange = (event) => {
      const radioValue = event.target.value;
      const value = isNumerical ? Number(radioValue) : radioValue;
      setValue(value);
      setItem(id, value);
    };

    for (const { value, html } of options) {
      const inputId = `${id}--${value}`;

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.id = inputId;
      radio.name = setting;
      radio.value = value;
      radio.checked = value === initialValue;
      fieldset.appendChild(radio);

      const label = document.createElement("label");
      label.htmlFor = inputId;
      label.innerHTML = html;
      fieldset.appendChild(label);

      radio.addEventListener("change", onChange);
    }

    parent.appendChild(fieldset);
  }

  appendHint(div, hintId) {
    const hint = document.getElementById(hintId);
    div.appendChild(hint);
  }
}
