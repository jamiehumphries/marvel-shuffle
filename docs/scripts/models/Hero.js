import { Aspect } from "./Aspect.js?v=cf7f9fb1";
import { Card } from "./Card.js?v=1073b8a0";

export class Hero extends Card {
  constructor(
    name,
    alterEgo,
    aspects,
    color,
    traits,
    hp,
    exludedDeckCards,
    { hasGiantForm = false, hasWideForm = false, include = () => false } = {},
  ) {
    const subname = alterEgo;
    const hasBack = true;
    const baseChildCardCount = aspects.length;
    const defaultChildCards = aspects;
    super(name, {
      subname,
      color,
      hasBack,
      baseChildCardCount,
      defaultChildCards,
      traits,
      hasGiantForm,
      hasWideForm,
    });
    this.hp = hp;
    this.exludedDeckCards = exludedDeckCards;
    this.include = include;
  }

  static get namePlural() {
    return "Heroes";
  }

  static get placeholderImageSrc() {
    return Aspect.placeholderImageSrc;
  }
}
