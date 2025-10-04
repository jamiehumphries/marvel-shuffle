import { Campaign } from "./Campaign.js?v=2f6133cc";
import { Card } from "./Card.js?v=63ff8842";

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
