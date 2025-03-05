import { getItem, setItem } from "../data/storage.js?v=62f5cba1";
import { initializeDifficultySettings } from "../data/tracker.js?v=8c47738d";
import { Setting } from "../models/Setting.js?v=d11fdf30";

export class Settings {
  constructor(maxNumberOfHeroes, maxNumberOfExtraModulars) {
    this.maxNumberOfHeroes = maxNumberOfHeroes;
    this.maxNumberOfExtraModulars = maxNumberOfExtraModulars;
  }

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
    this.initializeNumberOfExtraModulars();
    this.initializeTrackerSettings();
  }

  initializeNumberOfHeroes() {
    const setting = "number-of-heroes";
    const min = 1;
    const max = this.maxNumberOfHeroes;
    const setValue = (value) => (this.numberOfHeroes = value);
    this.initializeNumericSetting(setting, min, max, setValue);
  }

  initializeNumberOfExtraModulars() {
    const setting = "number-of-extra-modulars";
    const min = 0;
    const max = this.maxNumberOfExtraModulars;
    const setValue = (value) => (this.numberOfExtraModulars = value);
    this.initializeNumericSetting(setting, min, max, setValue);
  }

  initializeNumericSetting(setting, min, max, setValue) {
    const id = `setting--${setting}`;

    const allowedValues = Array.from(
      { length: max - min + 1 },
      (_, i) => min + i,
    );

    const storedValue = getItem(id);
    const initialValue = allowedValues.includes(storedValue)
      ? storedValue
      : allowedValues[0];
    setValue(initialValue);

    const fieldset = document.getElementById(id);
    fieldset.classList.add("numeric-setting");

    const onChange = (event) => {
      const value = Number(event.target.value);
      setValue(value);
      setItem(id, value);
    };

    for (let i = min; i <= max; i++) {
      const inputId = `${setting}-${i}`;

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.id = inputId;
      radio.name = setting;
      radio.value = i;
      radio.checked = i === initialValue;
      fieldset.appendChild(radio);

      const label = document.createElement("label");
      label.htmlFor = inputId;
      label.innerText = i;
      fieldset.appendChild(label);

      radio.addEventListener("change", onChange);
    }
  }

  initializeTrackerSettings() {
    const preferencesElement = document.getElementById("preferences");

    this._showTrackerSetting = new Setting(
      "show-tracker",
      "Show game tracker under shuffle",
      {
        onChange: (checked) =>
          document.body.classList.toggle("show-tracker", checked),
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

    for (const setting of settings) {
      setting.appendTo(preferencesElement);
    }
  }
}
