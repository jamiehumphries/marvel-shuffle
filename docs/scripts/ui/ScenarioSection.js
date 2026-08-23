import { scenarios } from "../data/cards.js";
import { getNumberOfIncompleteGames } from "../shared/tracker.js";
import { Section } from "./Section.js";

export class ScenarioSection extends Section {
  constructor(settings) {
    super(settings, scenarios, 1);
  }

  get maxNextScenarioOptions() {
    if (this._maxNextScenarioOptions) {
      return this._maxNextScenarioOptions;
    }
    const nextScenarioOptionCounts = this.selectableCards.map(
      (card) => card.nextScenarioOptions?.length || 0,
    );
    return (this._maxNextScenarioOptions = Math.max(
      ...nextScenarioOptionCounts,
    ));
  }

  get nextScenarioOptions() {
    return this.trueCard?.nextScenarioOptions;
  }

  initializeSectionRelationships() {
    this.childSection = this.modularSection;
  }

  setCards(value) {
    super.setCards(value);
    const nextScenarioOptions = this.nextScenarioOptions || [];

    const singleNextScenario =
      nextScenarioOptions.length === 1 ? nextScenarioOptions[0] : null;
    document.body.classList.toggle("has-next-scenario", !!singleNextScenario);
    this.nextScenarioButton.dataset.id = singleNextScenario?.id || "";
    this.nextScenarioButton.tabIndex = singleNextScenario ? 0 : -1;
    this.campaignImage.src = singleNextScenario?.campaign.imageSrc || "";

    document.body.classList.toggle(
      "has-next-scenario-options",
      nextScenarioOptions.length > 1,
    );

    for (let i = 0; i < this.nextScenarioOptionButtons.length; i++) {
      const button = this.nextScenarioOptionButtons[i];
      const option = singleNextScenario ? null : nextScenarioOptions[i];
      button.dataset.id = option?.id || "";
      button.querySelector("img").src = option?.frontSrc || "";
      button.querySelector(".name").innerText = option?.name || "";
      button.classList.toggle("hidden", !option);
      button.tabIndex = option ? 0 : -1;
    }
  }

  initializeLayout() {
    super.initializeLayout();

    const nextScenarioButtonTemplate = document.getElementById(
      "next-scenario-button",
    );
    const nextScenarioButton =
      nextScenarioButtonTemplate.content.firstElementChild.cloneNode(true);
    this.root.appendChild(nextScenarioButton);
    this.nextScenarioButton = this.root.querySelector(".next-scenario-button");
    this.nextScenarioButton.addEventListener("click", (event) =>
      this.goToNextScenarioOption(event),
    );
    this.campaignImage = this.root.querySelector(".campaign-image");

    const nextScenarioOptionButtonsDiv = document.createElement("div");
    nextScenarioOptionButtonsDiv.classList.add("next-scenario-option-buttons");
    this.root.appendChild(nextScenarioOptionButtonsDiv);
    const nextScenarioOptionButtonTemplate = document.getElementById(
      "next-scenario-option-button",
    );
    this.nextScenarioOptionButtons = [];
    for (let i = 0; i < this.maxNextScenarioOptions; i++) {
      const nextScenarioOptionButton =
        nextScenarioOptionButtonTemplate.content.firstElementChild.cloneNode(
          true,
        );
      this.nextScenarioOptionButtons.push(nextScenarioOptionButton);
      nextScenarioOptionButtonsDiv.appendChild(nextScenarioOptionButton);
      nextScenarioOptionButton.addEventListener("click", (event) =>
        this.goToNextScenarioOption(event),
      );
    }
  }

  goToNextScenarioOption(event) {
    const { id } = event.currentTarget.dataset;
    const card = this.selectableCards.find((card) => card.id === id);
    this.shuffle({ forcedCards: [card] });
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
