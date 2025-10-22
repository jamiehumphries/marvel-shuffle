import { Model } from "./Model.js?v=b19a6e7e";
import { Option } from "./Option.js?v=1a22a1c3";

export class Card extends Option {
  constructor(
    name,
    {
      subname = null,
      color = null,
      isLandscape = false,
      hasBack = false,
      baseChildCardCount = 0,
      minChildCardCountVariability = 0,
      excludedChildCards = [],
      hardExcludedChildCards = [],
      requiredChildCards = [],
      defaultChildCards = [],
      additionalChildCardsPerHero = 0,
      traits = [],
      hasGiantForm = false,
      hasWideForm = false,
      isUncounted = false,
      requiredReason = null,
    } = {},
  ) {
    const slugModifier = subname;
    super(name, { subname, slugModifier });

    this.color = color;
    this.isLandscape = isLandscape;
    this.baseChildCardCount = baseChildCardCount;
    this.minChildCardCountVariability = minChildCardCountVariability;
    this.excludedChildCards = excludedChildCards.concat(hardExcludedChildCards);
    this.hardExcludedChildCards = hardExcludedChildCards;
    this.requiredChildCards = requiredChildCards;
    this.defaultChildCards = defaultChildCards;
    this.additionalChildCardsPerHero = additionalChildCardsPerHero;
    this.traits = traits;
    this.hasGiantForm = hasGiantForm;
    this.hasWideForm = hasWideForm;
    this.isUncounted = isUncounted;
    this.requiredReason = requiredReason;

    this.frontSrc = this.image("front");
    this.hasBack = hasBack;
    this.backSrc = this.chooseBackSrc();

    const hasInnerForm = hasGiantForm || hasWideForm;
    [this.frontInnerSrc, this.backInnerSrc] = hasInnerForm
      ? [this.image("front-inner"), this.image("back-inner")]
      : [null, null];
  }

  static get id() {
    return this.slug;
  }

  static get namePlural() {
    return (this._namePlural ||= `${this.name}s`);
  }

  static get placeholderImageSrc() {
    return (this._placeholderImageSrc ||= Model.buildImage(this, "back"));
  }

  childCardCount(numberOfHeroes) {
    return (
      this.requiredChildCards.length +
      this.baseChildCardCount +
      this.additionalChildCardsPerHero * numberOfHeroes
    );
  }

  chooseBackSrc() {
    if (this.hasBack === true) {
      return this.image("back");
    }

    if (typeof this.hasBack === "function") {
      return Model.buildImage(this.hasBack, "back");
    }

    if (typeof this.hasBack === "string") {
      const slug = Model.buildSlug(this.hasBack);
      return Model.buildImage(this.type, slug, "back");
    }

    return Model.buildImage(this.type, "back");
  }

  image(side) {
    return Model.buildImage(this.type, this.slug, side);
  }
}
