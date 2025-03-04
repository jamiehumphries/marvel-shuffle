import { getNumberOfIncompleteGames } from "../tracker.js?v=bcc2ce19";
import { Section } from "./Section.js?v=55c1680f";

export class HeroSection extends Section {
  constructor(settings, cardsOrSets, nthOfType, { scenarioSection, ...other }) {
    super(settings, cardsOrSets, nthOfType, other);
    this.scenarioSection = scenarioSection;
    scenarioSection.heroSections.push(this);
  }

  getPriorityFromTracking(hero) {
    const scenario = this.scenarioSection.trueCard;
    return this.settings.avoidCompleted && scenario !== null
      ? getNumberOfIncompleteGames([scenario], [hero])
      : 1;
  }
}
