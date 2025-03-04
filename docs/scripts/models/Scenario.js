import { Campaign } from "./Campaign.js?v=3b9cbabb";
import { Card } from "./Card.js?v=66e17b27";

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
      hasGiantForm,
      baseChildCardCount,
      defaultChildCards,
      excludedChildCards,
      requiredChildCards,
      additionalChildCardsPerHero,
    });
  }

  get campaign() {
    return (this._campaign ||= this.parent.isCampaign
      ? new Campaign(this.parent)
      : null);
  }
}
