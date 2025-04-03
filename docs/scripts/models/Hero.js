import { Card } from "./Card.js";

export class Hero extends Card {
  constructor(
    name,
    alterEgo,
    aspects,
    color,
    traits,
    hp,
    { hasGiantForm = false, hasWideForm = false, include = null } = {},
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
    this.include = include;
  }

  static get namePlural() {
    return "Heroes";
  }
}
