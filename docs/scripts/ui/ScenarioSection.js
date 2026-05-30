import { scenarios } from "../data/cards.js";
import { Scenario } from "../models/Scenario.js";
import { chooseRandom, ensureArray } from "../shared/helpers.js";
import { getNumberOfIncompleteGames } from "../shared/tracker.js";
import { Section } from "./Section.js";

export class ScenarioSection extends Section {
  constructor(settings) {
    super(settings, scenarios, 1);
  }

  get maxVariableOrderVillains() {
    if (this._maxVariableOrderVillains) {
      return this._maxVariableOrderVillains;
    }
    const variableOrderVillainCounts = this.selectableCards.map(
      (card) => card.villainGroup?.variableOrderVillains?.length || 0,
    );
    return (this._maxVariableOrderVillains = Math.max(
      ...variableOrderVillainCounts,
    ));
  }

  get nextScenario() {
    const cardSet = this.trueCard?.parent;
    if (!cardSet?.isCampaign) {
      return null;
    }

    const scenarioIndex = cardSet.children.indexOf(this.trueCard);
    return cardSet.children[scenarioIndex + 1] || null;
  }

  get villainGroup() {
    return this.trueCard?.villainGroup;
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

    const hasVillainGroup = !!this.villainGroup;
    document.body.classList.toggle("has-villain-group", hasVillainGroup);
    if (!hasVillainGroup) {
      return;
    }

    for (let i = 0; i < this.nextVillainButtons.length; i++) {
      const button = this.nextVillainButtons[i];
      const { variableOrderVillains, finalVillain } = this.villainGroup;

      let villain;
      if (i < variableOrderVillains.length) {
        villain = variableOrderVillains[i];
      } else if (i === variableOrderVillains.length) {
        villain = {
          id: variableOrderVillains.map((card) => card.id),
          name: `Random Next ${this.trueCard.groupName}`,
          frontSrc: Scenario.placeholderImageSrc,
        };
      } else if (i === variableOrderVillains.length + 1) {
        villain = finalVillain;
      } else {
        villain = null;
      }
      button.dataset.ids = villain
        ? JSON.stringify(ensureArray(villain.id))
        : "";
      button.querySelector("img").src = villain?.frontSrc || "";
      button.querySelector(".name").innerText = villain?.name || "";
      button.querySelector(".subname").innerText = villain?.groupName || "";
      button.classList.toggle("random", Array.isArray(villain?.id));
      button.classList.toggle("hidden", !villain);
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
    this.nextScenarioButton.addEventListener("click", () =>
      this.goToNextScenario(),
    );
    this.campaignImage = this.root.querySelector(".campaign-image");

    const nextVillainButtonsDiv = document.createElement("div");
    nextVillainButtonsDiv.classList.add("next-villain-buttons");
    this.root.appendChild(nextVillainButtonsDiv);
    const nextVillainButtonTemplate = document.getElementById(
      "next-villain-button",
    );
    this.nextVillainButtons = [];
    for (let i = 0; i < this.maxVariableOrderVillains + 2; i++) {
      const nextVillainButton =
        nextVillainButtonTemplate.content.firstElementChild.cloneNode(true);
      this.nextVillainButtons.push(nextVillainButton);
      nextVillainButtonsDiv.appendChild(nextVillainButton);
      nextVillainButton.addEventListener("click", (event) =>
        this.goToNextVillain(event),
      );
    }
  }

  goToNextScenario() {
    this.shuffle({ forcedCards: [this.nextScenario] });
  }

  goToNextVillain(event) {
    const button = event.currentTarget;
    const ids = JSON.parse(button.dataset.ids);
    const id = chooseRandom(ids);
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
