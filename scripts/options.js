class Option {
  constructor(name, { variant = null, type = null, children = null } = {}) {
    this.name = name;
    this.type = type || this.constructor;
    this.slug = slug(this.name, variant);
    this.id = `${this.type.slug}--${this.slug}`;
    this.children = children;
  }

  get checked() {
    if (this._checked === undefined) {
      this._checked = localStorage.getItem(this.id) === "true";
    }
    return this._checked;
  }

  set checked(value) {
    this.setChecked(value, true, true);
  }

  get children() {
    return this._children;
  }

  set children(value) {
    this._children = value;
    value?.forEach((child) => (child.parent = this));
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

    const checkmark = document.createElement("div");
    checkmark.classList.add("checkmark");

    label.appendChild(input);
    label.appendChild(checkmark);
    label.append(this.name);

    input.addEventListener("click", (event) => {
      this.checked = event.target.checked;
    });

    this.checkbox = input;
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
    const name = `All ${section.type.namePlural}`;
    const type = section.type;
    const children = section.cardsOrSets;
    super(name, { type, children });

    this.setChecked(
      children.every((child) => child.checked),
      false,
      false
    );
  }

  appendTo(element) {
    super.appendTo(element, "all");
  }
}

class CardSet extends Option {
  constructor(name, cards) {
    const variant = "set";
    const type = cards[0].constructor;
    const children = cards;
    super(name, { variant, type, children });
  }

  appendTo(element) {
    super.appendTo(element, "set");
    this.children.forEach((card) => card.appendTo(element, "set-member"));
  }
}

class Card extends Option {
  constructor(
    name,
    {
      variant = null,
      isLandscape = false,
      childCardCount = 0,
      excludedChildCards = [],
      defaultChildCards = null,
      hasBack = false,
    } = {}
  ) {
    super(name, { variant });
    this.isLandscape = isLandscape;
    this.childCardCount = childCardCount;
    this.excludedChildCards = excludedChildCards;
    this.defaultChildCards = defaultChildCards;
    const image = (...path) => `images/${this.type.slug}/${path.join("/")}`;
    this.frontSrc = image(this.slug, "front.png");
    this.backSrc = hasBack ? image(this.slug, "back.png") : image("back.png");
  }

  static get id() {
    return this.slug;
  }

  static get slug() {
    return (this._slug ||= slug(this.name));
  }

  static get namePlural() {
    return (this._name ||= `${this.name}s`);
  }
}

class Scenario extends Card {
  constructor(name, modulesOrNumber, { exclude = [], hasBack = false } = {}) {
    const [childCardCount, defaultChildCards] = Array.isArray(modulesOrNumber)
      ? [modulesOrNumber.length, modulesOrNumber]
      : [modulesOrNumber, null];
    const excludedChildCards = exclude;
    super(name, {
      hasBack,
      childCardCount,
      defaultChildCards,
      excludedChildCards,
    });
  }
}

class Module extends Card {
  constructor(name, { isLandscape = false } = {}) {
    super(name, { isLandscape });
  }

  static get placeholder() {
    if (this._placeholder) {
      return this._placeholder;
    }
    const card = new this(`No modules needed`);
    card.frontSrc = card.backSrc = `images/${this.slug}/back.png`;
    return (this._placeholder = card);
  }
}

class Hero extends Card {
  constructor(name, aspects, { alterEgo = null } = {}) {
    const variant = alterEgo;
    const hasBack = true;
    const childCardCount = aspects.length;
    const defaultChildCards = aspects;
    super(name, { variant, hasBack, childCardCount, defaultChildCards });
  }

  static get namePlural() {
    return "Heroes";
  }
}

class Aspect extends Card {
  constructor(name) {
    super(name);
  }
}

function slug(...names) {
  return names
    .join()
    .toLowerCase()
    .replaceAll(/’/g, "") // Remove apostrophes.
    .replaceAll(/[^a-zA-Z0-9]+/g, "-") // Replace all non-word characters with "-".
    .replaceAll(/(^\-+|\-+$)/g, ""); // Strip any leading and trailing "-".
}

export { All, CardSet, Scenario, Module, Hero, Aspect };
