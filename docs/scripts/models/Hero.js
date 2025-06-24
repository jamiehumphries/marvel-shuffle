import { Card } from "./Card.js?v=23473083";

export class Hero extends Card {
  constructor(
    name,
    alterEgo,
    aspects,
    color,
    traits,
    hp,
    uniqueDeckCards,
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
    this.uniqueDeckCards = uniqueDeckCards;
    this.include = include;
  }

  static get namePlural() {
    return "Heroes";
  }
}
