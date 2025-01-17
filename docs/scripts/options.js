import { getItem, setItem } from "./storage.js?v=00ea94bd";

class Option {
  constructor(
    title,
    {
      type = null,
      slug = null,
      slugModifier = null,
      children = null,
      onChange = null,
      defaultValue = null,
    } = {},
  ) {
    this.title = title;
    this.type = type || this.constructor;
    this.slug = slug || getSlug(this.title, slugModifier);
    this.id = `${this.type.slug}--${this.slug}`;
    this.children = children;
    this._onChange = onChange;
    this.defaultValue = defaultValue;
  }

  get checked() {
    if (this._checked === undefined) {
      if (this.children) {
        this._checked = this.children.every((child) => child.checked);
      } else {
        const storedValue = getItem(this.id);
        this._checked = storedValue === null ? this.defaultValue : storedValue;
      }
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
    classes.forEach((className) => label.classList.add(className));

    const input = document.createElement("input");
    input.id = this.id;
    input.type = "checkbox";
    input.checked = this.checked;
    this.onChange(this.checked);

    const checkmark = document.createElement("div");
    checkmark.classList.add("checkmark");

    label.appendChild(input);
    label.appendChild(checkmark);

    const textWrapperDiv = document.createElement("div");

    const titleDiv = document.createElement("div");
    titleDiv.innerText = this.title;
    textWrapperDiv.append(titleDiv);

    if (this.subtitle) {
      const subtitleDiv = document.createElement("div");
      subtitleDiv.innerText = this.subtitle;
      subtitleDiv.classList.add("subtitle");
      textWrapperDiv.append(subtitleDiv);
    }

    label.append(textWrapperDiv);

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

  setChecked(value, cascadeUp, cascadeDown) {
    this._checked = value;
    this.onChange(value);
    if (!this.children) {
      setItem(this.id, value);
    }
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
    this.updateIndeterminateState();
  }

  updateIndeterminateState() {
    this.checkbox.indeterminate = !this.checked && this.anyDescendantChecked;
  }
}

class Setting extends Option {
  constructor(slug, label, { onChange = null, defaultValue = null } = {}) {
    super(label, { slug, onChange, defaultValue });
  }

  static get slug() {
    return "setting";
  }
}

class All extends Option {
  constructor(section) {
    const title = `All ${section.type.titlePlural}`;
    const type = section.type;
    const children = section.cardsOrSets;
    super(title, { type, children });
  }

  appendTo(element) {
    super.appendTo(element, "all");
  }
}

class CardSet extends Option {
  constructor(title, cards, isCampaign) {
    const type = cards[0].constructor;
    const slugModifier = "set";
    const children = cards;
    super(title, { type, slugModifier, children });
    this.isCampaign = isCampaign;
  }

  appendTo(element) {
    super.appendTo(element, "set");
    this.children.forEach((card) => card.appendTo(element, "set-member"));
  }
}

class Card extends Option {
  constructor(
    title,
    {
      subtitle = null,
      color = null,
      isLandscape = false,
      baseChildCardCount = 0,
      excludedChildCards = [],
      requiredChildCards = [],
      defaultChildCards = null,
      additionalChildCardsPerHero = 0,
      hasBack = false,
      hasGiantForm = false,
      hasWideForm = false,
    } = {},
  ) {
    const slugModifier = subtitle;
    super(title, { slugModifier });

    this.subtitle = subtitle;
    this.color = color;
    this.isLandscape = isLandscape;
    this.baseChildCardCount = baseChildCardCount;
    this.excludedChildCards = excludedChildCards;
    this.requiredChildCards = requiredChildCards;
    this.defaultChildCards = defaultChildCards;
    this.additionalChildCardsPerHero = additionalChildCardsPerHero;
    this.hasGiantForm = hasGiantForm;
    this.hasWideForm = hasWideForm;

    const image = (...path) => ["/images", this.type.slug, ...path].join("/");
    this.frontSrc = image(this.slug, "front.png");
    this.backSrc = hasBack ? image(this.slug, "back.png") : image("back.png");

    const hasInnerForm = hasGiantForm || hasWideForm;
    [this.frontInnerSrc, this.backInnerSrc] = hasInnerForm
      ? [
          image(this.slug, "front-inner.png"),
          image(this.slug, "back-inner.png"),
        ]
      : [null, null];
  }

  static get id() {
    return this.slug;
  }

  static get slug() {
    return (this._slug ||= getSlug(this.title));
  }

  static get title() {
    return this.name;
  }

  static get titlePlural() {
    return (this._titlePlural ||= `${this.title}s`);
  }

  childCardCount(numberOfHeroes) {
    return (
      this.requiredChildCards.length +
      this.baseChildCardCount +
      this.additionalChildCardsPerHero * numberOfHeroes
    );
  }
}

class Scenario extends Card {
  constructor(
    title,
    modulesOrNumber,
    color,
    {
      exclude = [],
      required = [],
      hasBack = false,
      hasGiantForm = false,
      additionalModulesPerHero = 0,
    } = {},
  ) {
    const [baseChildCardCount, defaultChildCards] = Array.isArray(
      modulesOrNumber,
    )
      ? [modulesOrNumber.length, modulesOrNumber]
      : [modulesOrNumber, null];
    const excludedChildCards = exclude;
    const requiredChildCards = required;
    const additionalChildCardsPerHero = additionalModulesPerHero;
    super(title, {
      color,
      hasBack,
      hasGiantForm,
      baseChildCardCount,
      defaultChildCards,
      excludedChildCards,
      requiredChildCards,
      additionalChildCardsPerHero,
    });
  }

  get campaignImageSrc() {
    const cardSet = this.parent;
    if (!cardSet.isCampaign) {
      return "";
    }
    const campaignSlug = cardSet.slug.slice(0, -"-set".length);
    return `/images/campaign/${campaignSlug}.png`;
  }
}

class Module extends Card {
  constructor(title, { isLandscape = false, hasBack = false } = {}) {
    super(title, { isLandscape, hasBack });
  }

  static get placeholder() {
    if (!this._placeholder) {
      const card = new this("No modules needed");
      card.frontSrc = card.backSrc = "/images/module/back.png";
      this._placeholder = card;
    }
    return this._placeholder;
  }
}

class Hero extends Card {
  constructor(
    title,
    aspects,
    color,
    { alterEgo = null, hasGiantForm = false, hasWideForm = false } = {},
  ) {
    const subtitle = alterEgo;
    const hasBack = true;
    const baseChildCardCount = aspects.length;
    const defaultChildCards = aspects;
    super(title, {
      subtitle,
      color,
      hasBack,
      hasGiantForm,
      hasWideForm,
      baseChildCardCount,
      defaultChildCards,
    });
  }

  static get titlePlural() {
    return "Heroes";
  }
}

class Aspect extends Card {
  constructor(title) {
    super(title);
  }
}

function getSlug(...parts) {
  return parts
    .join()
    .toLowerCase()
    .replaceAll(/’/g, "") // Remove apostrophes.
    .replaceAll(/[^a-zA-Z0-9]+/g, "-") // Replace all non-word characters with "-".
    .replaceAll(/(^\-+|\-+$)/g, ""); // Strip any leading and trailing "-".
}

export { Setting, All, CardSet, Scenario, Module, Hero, Aspect };
