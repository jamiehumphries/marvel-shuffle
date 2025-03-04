import { Card } from "./Card.js?v=66e17b27";

export class Hero extends Card {
  constructor(
    name,
    aspects,
    color,
    { alterEgo = null, hasGiantForm = false, hasWideForm = false } = {},
  ) {
    const subname = alterEgo;
    const hasBack = true;
    const baseChildCardCount = aspects.length;
    const defaultChildCards = aspects;
    super(name, {
      subname,
      color,
      hasBack,
      hasGiantForm,
      hasWideForm,
      baseChildCardCount,
      defaultChildCards,
    });
  }

  static get namePlural() {
    return "Heroes";
  }
}
