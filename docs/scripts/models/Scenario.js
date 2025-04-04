import { Campaign } from "./Campaign.js";
import { Card } from "./Card.js";

export class Scenario extends Card {
  constructor(
    name,
    modularsOrNumber,
    color,
    {
      exclude = [],
      required = [],
      hasBack = false,
      hasGiantForm = false,
      additionalModularsPerHero = 0,
    } = {},
  ) {
    const [baseChildCardCount, defaultChildCards] = Array.isArray(
      modularsOrNumber,
    )
      ? [modularsOrNumber.length, modularsOrNumber]
      : [modularsOrNumber, []];
    const excludedChildCards = exclude;
    const requiredChildCards = required;
    const additionalChildCardsPerHero = additionalModularsPerHero;
    super(name, {
      color,
      hasBack,
      baseChildCardCount,
      excludedChildCards,
      requiredChildCards,
      defaultChildCards,
      additionalChildCardsPerHero,
      hasGiantForm,
    });
  }

  get campaign() {
    return (this._campaign ||= this.parent.isCampaign
      ? new Campaign(this.parent)
      : null);
  }
}
