class Option {
  get checkbox() {
    return document.getElementById(this.id);
  }

  get checked() {
    return (this._checked ||= localStorage.getItem(this.id) === "true");
  }

  set checked(value) {
    this.setChecked(value, true, true);
  }

  get children() {
    return this._children;
  }

  set children(value) {
    this._children = value;
    value.forEach((child) => (child.parent = this));
  }

  appendTo(element, ...classes) {
    const label = document.createElement("label");
    label.htmlFor = this.id;
    label.classList.add("option");
    classes.forEach((className) => label.classList.add(className));

    const input = document.createElement("input");
    input.id = this.id;
    input.type = "checkbox";
    input.checked = this.checked;

    const checkmark = document.createElement("checkmark");
    checkmark.classList.add("checkmark");

    label.appendChild(input);
    label.appendChild(checkmark);
    label.append(this.name);
    input.addEventListener("click", (event) => {
      this.checked = event.target.checked;
    });

    element.appendChild(label);
  }

  setChecked(value, cascadeUp, cascadeDown) {
    this._checked = value;
    localStorage.setItem(this.id, value);
    if (this.checkbox) {
      this.checkbox.checked = value;
    }
    if (this.children && cascadeDown) {
      this.children.forEach((child) => child.setChecked(value, false, true));
    }
    if (this.parent && cascadeUp) {
      const siblings = this.parent.children;
      const allSiblingsChecked = siblings.every((child) => child.checked);
      this.parent.setChecked(allSiblingsChecked, true, false);
    }
  }
}

class All extends Option {
  constructor(section) {
    super();
    this.name = `All ${section.type.namePlural}`;
    this.id = getId(this);
    this.children = section.cardsOrSets;
  }

  appendTo(element) {
    super.appendTo(element, "all");
  }
}

class CardSet extends Option {
  constructor(name, cards) {
    super();
    this.name = name;
    this.id = `${getId(this)}-${cards[0].constructor.id}`;
    this.children = cards;
  }

  appendTo(element) {
    super.appendTo(element, "set");
    this.children.forEach((card) => card.appendTo(element, "set-member"));
  }
}

class Card extends Option {
  static get id() {
    return (this._id ||= getId(this));
  }

  static get namePlural() {
    return (this._name ||= `${this.name}s`);
  }

  constructor(name, { isLandscape = false, hasBack = false } = {}) {
    super();
    const type = this.constructor;
    this.name = name;
    this.id = getId(this);
    this.isLandscape = isLandscape;
    this.frontSrc = `images/${type.id}/${this.id}/front.png`;
    this.backSrc = hasBack
      ? `images/${type.id}/${this.id}/back.png`
      : `images/${type.id}/back.png`;
  }
}

class Scenario extends Card {
  constructor(name, hasBack = false) {
    super(name, { hasBack });
  }
}

class Module extends Card {
  constructor(name, isLandscape = true) {
    super(name, { isLandscape });
  }
}

class Hero extends Card {
  static get namePlural() {
    return "Heroes";
  }

  constructor(name) {
    super(name, { hasBack: true });
  }
}

class Aspect extends Card {
  constructor(name) {
    super(name);
  }
}

function getId(obj) {
  return obj.name
    .toLowerCase()
    .replaceAll(/\W+/g, "-") // Replace all non-word characters with "-".
    .replaceAll(/(^\-+|\-+$)/g, ""); // Strip any leading and trailing "-".
}

export { All, CardSet, Scenario, Module, Hero, Aspect };
