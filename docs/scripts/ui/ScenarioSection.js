import { scenarios } from "../data/cards.js";
import { getNumberOfIncompleteGames } from "../data/tracker.js";
import { Section } from "./Section.js";

export class ScenarioSection extends Section {
  constructor(settings) {
    super(settings, scenarios, 1);
  }

  get nextScenario() {
    const trueCard = this.trueCards[0];
    const cardSet = trueCard?.parent;
    if (!cardSet?.isCampaign) {
      return null;
    }

    const scenarioIndex = cardSet.children.indexOf(trueCard);
    return cardSet.children[scenarioIndex + 1] || null;
  }

  initializeSectionRelationships() {
    this.childSection = this.modularSection;
  }

  setCards(value) {
    super.setCards(value);
    const hasNextScenario = !!this.nextScenario;
    [this.campaignImage.src, this.nextScenarioButton.tabIndex] = hasNextScenario
      ? [this.nextScenario.campaign.imageSrc, 0]
      : ["", -1];
    document.body.classList.toggle("has-next-scenario", hasNextScenario);
  }

  initializeLayout() {
    super.initializeLayout();
    const buttonTemplate = document.getElementById("next-scenario-button");
    const element = buttonTemplate.content.cloneNode(true);
    this.root.appendChild(element);

    this.nextScenarioButton = this.root.querySelector(".next-scenario-button");
    this.nextScenarioButton.addEventListener("click", () =>
      this.goToNextScenario(),
    );

    this.campaignImage = this.root.querySelector(".campaign-image");
  }

  goToNextScenario() {
    this.shuffle({ forcedCards: [this.nextScenario] });
  }

  getPriority(scenario, isShuffleAll) {
    if (!this.settings.avoidCompleted) {
      return 1;
    }

    const heroes = isShuffleAll
      ? this.heroSections[0].checkedCards
      : this.heroSections.flatMap((section) => section.trueCards);
    const difficulties = isShuffleAll
      ? this.difficultySection.checkedCards
      : this.difficultySection.trueCards;
    return getNumberOfIncompleteGames([scenario], heroes, difficulties);
  }
}
