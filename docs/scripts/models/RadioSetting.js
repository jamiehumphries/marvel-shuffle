import { getItem, setItem } from "../data/storage.js";

export class RadioSetting {
  constructor(
    slug,
    legend,
    options,
    { onChange = null, defaultValue = null } = {},
  ) {
    this.id = `setting--${slug}`;
    this.slug = slug;
    this.legend = legend;
    this.options = options;
    this._onChange = onChange;
    this.defaultValue = defaultValue || options[0].value;
  }

  get value() {
    if (this._value === undefined) {
      const storedValue = getItem(this.id);
      this._value = this.allowedValues.includes(storedValue)
        ? storedValue
        : this.defaultValue;
    }
    return this._value;
  }

  set value(value) {
    return this.setValue(value);
  }

  get allowedValues() {
    return (this._allowedValues ||= this.options.map((option) => option.value));
  }

  appendTo(element) {
    const isNumerical = this.allowedValues.every((value) => !isNaN(value));

    const fieldset = document.createElement("fieldset");
    fieldset.id = this.id;
    fieldset.classList.add("radio-setting");
    if (isNumerical) {
      fieldset.classList.add("numerical-setting");
    }

    const fieldsetLegend = document.createElement("legend");
    fieldsetLegend.innerText = this.legend;
    fieldset.appendChild(fieldsetLegend);

    this.radioButtons = [];
    for (const { value, html } of this.options) {
      const inputId = `${this.id}--${value}`;

      const radio = document.createElement("input");
      radio.type = "radio";
      radio.id = inputId;
      radio.name = this.slug;
      radio.value = value;
      radio.checked = value === this.value;
      fieldset.appendChild(radio);

      const label = document.createElement("label");
      label.htmlFor = inputId;
      label.innerHTML = html;
      fieldset.appendChild(label);

      radio.addEventListener("change", (event) => {
        const radioValue = event.target.value;
        const value = isNumerical ? Number(radioValue) : radioValue;
        this.value = value;
      });

      this.radioButtons.push(radio);
    }

    element.appendChild(fieldset);
    this.onChange(this.value);
  }

  onChange(value) {
    if (this._onChange) {
      this._onChange(value);
    }
  }

  setValue(value) {
    this._value = value;
    this.onChange(value);
    setItem(this.id, value);
    for (const radio of this.radioButtons) {
      radio.checked = radio.value === value.toString();
    }
  }
}
