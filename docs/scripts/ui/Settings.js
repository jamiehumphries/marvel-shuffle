import { Setting } from "../models/Setting.js?v=8fcb84d9";
import { getItem, setItem } from "../storage.js?v=b419bdb4";
import { initializeDifficultySettings } from "../tracker.js?v=bcc2ce19";

export class Settings {
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

    this.maxNumberOfHeroes = 4;
    const allowedValues = Array.from(
      { length: this.maxNumberOfHeroes },
      (_, i) => i + 1,
    );

    this.numberOfHeroes = getItem(id);
    if (!allowedValues.includes(this.numberOfHeroes)) {
      this.numberOfHeroes = allowedValues[0];
    }

    const fieldset = document.getElementById(id);

    const onChange = (event) => {
      const value = Number(event.target.value);
      this.numberOfHeroes = value;
      setItem(id, value);
    };

    for (let i = 1; i <= this.maxNumberOfHeroes; i++) {
      const inputId = `number-of-heroes-${i}`;

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.id = inputId;
      radio.name = "number-of-heroes";
      radio.value = i;
      radio.checked = i === this.numberOfHeroes;
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
