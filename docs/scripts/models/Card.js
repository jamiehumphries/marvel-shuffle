import { image } from "../helpers.js?v=b2f4ffde";
import { Option } from "./Option.js?v=f6da124b";

export class Card extends Option {
  constructor(
    name,
    {
      subname = null,
      color = null,
      isLandscape = false,
      baseChildCardCount = 0,
      excludedChildCards = [],
      requiredChildCards = [],
      defaultChildCards = [],
      additionalChildCardsPerHero = 0,
      hasBack = false,
      hasGiantForm = false,
      hasWideForm = false,
      traits = [],
    } = {},
  ) {
    const slugModifier = subname;
    super(name, { slugModifier });

    this.subname = subname;
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
    return (this._placeholderImageSrc ||= image(this, "back.png"));
  }

  childCardCount(numberOfHeroes) {
    return (
      this.requiredChildCards.length +
      this.baseChildCardCount +
      this.additionalChildCardsPerHero * numberOfHeroes
    );
  }

  image(...pathParts) {
    return image(this.type, ...pathParts);
  }
}
