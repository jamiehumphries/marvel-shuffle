import { Model } from "./Model.js?v=5c4d2c88";
import { Option } from "./Option.js?v=94d8a3da";

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

    this.frontSrc = this.image(this.slug, "front.png");
    this.backSrc = hasBack
      ? this.image(this.slug, "back.png")
      : this.image("back.png");

    const hasInnerForm = hasGiantForm || hasWideForm;
    [this.frontInnerSrc, this.backInnerSrc] = hasInnerForm
      ? [
          this.image(this.slug, "front-inner.png"),
          this.image(this.slug, "back-inner.png"),
        ]
      : [null, null];
  }

  static get id() {
    return this.slug;
  }

  static get namePlural() {
    return (this._namePlural ||= `${this.name}s`);
  }

  static get placeholderImageSrc() {
    return (this._placeholderImageSrc ||= Model.buildImage(this, "back.png"));
  }

  childCardCount(numberOfHeroes) {
    return (
      this.requiredChildCards.length +
      this.baseChildCardCount +
      this.additionalChildCardsPerHero * numberOfHeroes
    );
  }

  image(...pathParts) {
    return Model.buildImage(this.type, ...pathParts);
  }
}
