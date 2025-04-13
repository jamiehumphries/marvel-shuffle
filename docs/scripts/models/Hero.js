import { Card } from "./Card.js?v=9012d1bd";

export class Hero extends Card {
  constructor(
    name,
    alterEgo,
    aspects,
    color,
    traits,
    hp,
    allies,
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
    this.allies = allies;
    this.include = include;
  }

  static get namePlural() {
    return "Heroes";
  }
}
