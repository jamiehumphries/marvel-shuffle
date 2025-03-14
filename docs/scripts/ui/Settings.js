import { extraModulars } from "../data/cards.js?v=2121f86f";
import { getItem, setItem } from "../data/storage.js?v=62f5cba1";
import { initializeDifficultySettings } from "../data/tracker.js?v=8c47738d";
import { Setting } from "../models/Setting.js?v=d11fdf30";

const PROBABILITY_MAP = {
  never: 0,
  low: 0.05,
  medium: 0.1,
  high: 0.25,
  always: 1,
};

export class Settings {
  constructor(maxNumberOfHeroes, maxNumberOfExtraModulars) {
    this.maxNumberOfHeroes = maxNumberOfHeroes;
    this.maxNumberOfExtraModulars = maxNumberOfExtraModulars;
    this._cardProbabilities = {};
  }

  get avoidCompleted() {
    return this.showTracker && this._avoidCompletedSetting.checked;
  }

  get showTracker() {
    return this._showTrackerSetting.checked;
  }

  get anyDifficultiesTracked() {
    return this._difficultySettings.some((setting) => setting.checked);
  }

  getProbability(card) {
    const probabilityKey = this._cardProbabilities[card.id];
    return PROBABILITY_MAP[probabilityKey];
  }

  initialize() {
    const preferencesDiv = document.getElementById("preferences");
    const customisationDiv = document.getElementById("customisation");
    const extraModularsHint = document.getElementById("extra-modulars");
    const uncountedModularsHint = document.getElementById("uncounted-modulars");

    this.initializeNumberOfHeroes(preferencesDiv);
    this.initializeTrackerSettings(preferencesDiv);

    customisationDiv.appendChild(extraModularsHint);
    this.initializeNumberOfExtraModulars(customisationDiv);
    customisationDiv.appendChild(uncountedModularsHint);
    this.initializeUncountedModulars(customisationDiv);
  }

  initializeNumberOfHeroes(parent) {
    this.initializeNumericalSetting(
      parent,
      "number-of-heroes",
      "Number of heroes",
      1,
      this.maxNumberOfHeroes,
      (value) => (this.numberOfHeroes = value),
    );
  }

  initializeTrackerSettings(parent) {
    this._showTrackerSetting = new Setting(
      "show-tracker",
      "Show game tracker under shuffle",
      {
        onChange: (checked) =>
          document.body.classList.toggle("show-tracker", checked),
      },
    );

    this._difficultySettings = initializeDifficultySettings();

    this._avoidCompletedSetting = new Setting(
      "avoid-completed",
      "Avoid completed games when shuffling",
    );

    const settings = [
      this._showTrackerSetting,
      ...this._difficultySettings,
      this._avoidCompletedSetting,
    ];

    for (const setting of settings) {
      setting.appendTo(parent);
    }
  }

  initializeNumberOfExtraModulars(parent) {
    this.initializeNumericalSetting(
      parent,
      "number-of-extra-modulars",
      "Extra modulars",
      0,
      this.maxNumberOfExtraModulars,
      (value) => (this.numberOfExtraModulars = value),
    );
  }

  initializeUncountedModulars(parent) {
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
        parent,
        `probability--${card.id}`,
        `Probability of adding ${card.name}`,
        options,
        (value) => (this._cardProbabilities[card.id] = value),
      );
    }
  }

  addHint(parent, html) {
    const hint = document.createElement("p");
    hint.classList.add("hint");
    hint.innerText = html;
    parent.appendChild(hint);
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
    fieldset.classList.add("radio-setting");
    if (isNumerical) {
      fieldset.classList.add("numerical-setting");
    }

    const fieldsetLegend = document.createElement("legend");
    fieldsetLegend.innerText = `${legend}:`;
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
}
