import { getItem, setItem } from "../data/storage.js?v=5a17bb47";
import { Model } from "./Model.js?v=e8bcf0fa";

export class Option extends Model {
  constructor(
    name,
    {
      subname = null,
      type = null,
      slug = null,
      slugModifier = null,
      children = null,
      onChange = null,
    } = {},
  ) {
    super();
    this.name = name;
    this.subname = subname;
    this.type = type || this.constructor;
    this.slug = slug || Model.buildSlug(this.name, slugModifier);
    this.id = `${this.type.slug}--${this.slug}`;
    this.children = children;
    this._onChange = onChange;
  }

  get checked() {
    if (this._checked === undefined) {
      if (this.children) {
        this._checked = this.children.every((child) => child.checked);
      } else {
        const storedValue = getItem(this.id);
        this._checked = storedValue === null ? false : storedValue;
      }
    }
    return this._checked;
  }

  set checked(value) {
    this.setChecked(value, { cascadeUp: true, cascadeDown: true });
  }

  get children() {
    return this._children;
  }

  set children(value) {
    this._children = value;
    if (!value) {
      return;
    }
    for (const child of value) {
      child.parent = this;
    }
  }

  get anyDescendantChecked() {
    if (!this.children) {
      return false;
    }
    return this.children.some(
      (child) => child.checked || child.anyDescendantChecked,
    );
  }

  appendTo(element, ...classes) {
    const label = document.createElement("label");
    label.htmlFor = this.id;
    label.classList.add("option");

    for (const className of classes) {
      label.classList.add(className);
    }

    const input = document.createElement("input");
    input.id = this.id;
    input.type = "checkbox";
    input.checked = this.checked;
    this.onChange(this.checked);

    const checkmark = document.createElement("div");
    checkmark.classList.add("checkmark");

    label.appendChild(input);
    label.appendChild(checkmark);

    const nameDiv = document.createElement("div");
    nameDiv.innerText = this.name;

    if (this.subname) {
      const subnameDiv = document.createElement("div");
      subnameDiv.innerText = this.subname;
      subnameDiv.classList.add("subname");
      nameDiv.appendChild(subnameDiv);
    }

    label.appendChild(nameDiv);

    input.addEventListener("click", (event) => {
      this.checked = event.target.checked;
    });

    this.checkbox = input;
    element.appendChild(label);

    this.updateIndeterminateState();
  }

  onChange(checked) {
    if (this._onChange) {
      this._onChange(checked);
    }
  }

  setChecked(value, { cascadeUp = false, cascadeDown = false } = {}) {
    this._checked = value;
    this.onChange(value);
    if (!this.children) {
      setItem(this.id, value);
    }
    if (this.checkbox) {
      this.checkbox.checked = value;
    }
    if (this.children && cascadeDown) {
      for (const child of this.children) {
        child.setChecked(value, { cascadeDown: true });
      }
    }
    if (this.parent && cascadeUp) {
      const siblings = this.parent.children;
      const allSiblingsChecked = siblings.every((child) => child.checked);
      this.parent.setChecked(allSiblingsChecked, { cascadeUp: true });
    }
    this.updateIndeterminateState();
  }

  updateIndeterminateState() {
    this.checkbox.indeterminate = !this.checked && this.anyDescendantChecked;
  }
}
