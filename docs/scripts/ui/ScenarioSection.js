import { scenarios } from "../data/cards.js?v=2121f86f";
import { getNumberOfIncompleteGames } from "../data/tracker.js?v=8c47738d";
import { Section } from "./Section.js?v=973f83f6";

export class ScenarioSection extends Section {
  constructor(settings) {
    super(settings, scenarios, 1);
    this.heroSections = [];
  }

  get nextScenario() {
    const cardSet = this.trueCard?.parent;
    if (!cardSet?.isCampaign) {
      return null;
    }

    const scenarioIndex = cardSet.children.indexOf(this.trueCard);
    if (scenarioIndex === cardSet.children.length - 1) {
      return null;
    }

    return cardSet.children[scenarioIndex + 1];
  }

  registerHeroSection(heroSection) {
    this.heroSections ||= [];
    this.heroSections.push(heroSection);
    heroSection.scenarioSection = this;
  }

  setCards(value) {
    super.setCards(value);
    this.campaignImage.src = this.nextScenario?.campaign?.imageSrc || "";
    document.body.classList.toggle("has-next-scenario", !!this.nextScenario);
  }

  initializeLayout() {
    super.initializeLayout();
    const buttonTemplate = document.getElementById("next-scenario-button");
    const element = buttonTemplate.content.cloneNode(true);
    this.root.appendChild(element);

    const button = this.root.querySelector(".next-scenario-button");
    button.addEventListener("click", () => this.goToNextScenario());

    this.campaignImage = this.root.querySelector(".campaign-image");
  }

  goToNextScenario() {
    this.shuffle({ forcedCards: [this.nextScenario] });
  }

  getPriorityFromTracking(scenario, isShuffleAll) {
    const heroes = isShuffleAll
      ? this.heroSections[0].checkedCards
      : this.heroSections
          .filter((section) => section.visible)
          .map((section) => section.trueCard)
          .filter((card) => !!card);

    return heroes.length > 0
      ? getNumberOfIncompleteGames([scenario], heroes)
      : 1;
  }
}
