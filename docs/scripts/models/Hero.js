import { Card } from "./Card.js?v=ffddac38";

export class Hero extends Card {
  constructor(
    name,
    alterEgo,
    aspects,
    color,
    { hasGiantForm = false, hasWideForm = false } = {},
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
      hasGiantForm,
      hasWideForm,
    });
  }

  static get namePlural() {
    return "Heroes";
  }
}
