import { Model } from "./Model.js";
import { Option } from "./Option.js";

export class Card extends Option {
  constructor(
    name,
    {
      subname = null,
      color = null,
      isLandscape = false,
      hasBack = false,
      baseChildCardCount = 0,
      excludedChildCards = [],
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
    this.excludedChildCards = excludedChildCards;
    this.requiredChildCards = requiredChildCards;
    this.defaultChildCards = defaultChildCards;
    this.additionalChildCardsPerHero = additionalChildCardsPerHero;
    this.traits = traits;
    this.hasGiantForm = hasGiantForm;
    this.hasWideForm = hasWideForm;
    this.isUncounted = isUncounted;
    this.requiredReason = requiredReason;

    this.frontSrc = this.image("front");
    this.backSrc =
      hasBack === true
        ? this.image("back")
        : Model.buildImage(hasBack || this.type, "back");

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

  image(side) {
    return Model.buildImage(this.type, this.slug, side);
  }
}
