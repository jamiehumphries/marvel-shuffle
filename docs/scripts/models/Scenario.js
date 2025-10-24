import { Campaign } from "./Campaign.js?v=9e27e633";
import { Card } from "./Card.js?v=0caf332c";

export class Scenario extends Card {
  constructor(
    name,
    modularsOrNumber,
    color,
    {
      exclude = [],
      hardExclude = [],
      required = [],
      hasBack = false,
      hasGiantForm = false,
      additionalModularsPerHero = 0,
      minModularsVariability = 0,
      schemes = [],
    } = {},
  ) {
    const [baseChildCardCount, defaultChildCards] = Array.isArray(
      modularsOrNumber,
    )
      ? [modularsOrNumber.length, modularsOrNumber]
      : [modularsOrNumber, []];
    const minChildCardCountVariability = minModularsVariability;
    const excludedChildCards = exclude;
    const hardExcludedChildCards = hardExclude;
    const requiredChildCards = required;
    const additionalChildCardsPerHero = additionalModularsPerHero;
    super(name, {
      color,
      hasBack,
      baseChildCardCount,
      minChildCardCountVariability,
      excludedChildCards,
      hardExcludedChildCards,
      requiredChildCards,
      defaultChildCards,
      additionalChildCardsPerHero,
      hasGiantForm,
    });
    this.schemes = schemes;
  }

  get campaign() {
    return (this._campaign ||= this.parent.isCampaign
      ? new Campaign(this.parent)
      : null);
  }

  childCardCount(numberOfHeroes) {
    return super.childCardCount(numberOfHeroes) + this.schemes.length;
  }
}
