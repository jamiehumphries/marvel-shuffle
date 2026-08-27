import { Campaign } from "./Campaign.js?v=5f37b058";
import { Card } from "./Card.js?v=4c3d87cb";

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
      special = [],
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
    this.specialModularOptionSets = special;
    this.nextScenarioOptions = null;
  }

  get campaign() {
    return (this._campaign ||= this.parent.isCampaign
      ? new Campaign(this.parent)
      : null);
  }

  childCardCount(numberOfHeroes) {
    return (
      super.childCardCount(numberOfHeroes) +
      this.specialModularOptionSets.length
    );
  }
}
