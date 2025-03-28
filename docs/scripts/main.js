import {
  clearUserId,
  createBookmarkUrl,
  getBookmarkUrl,
  initializeStorage,
  setUserId,
} from "./data/storage.js?v=e77ff9b5";
import { renderTable } from "./data/tracker.js?v=abb8ad52";
import { filter, requestPostAnimationFrame } from "./helpers.js?v=01996c74";
import { AspectSection } from "./ui/AspectSection.js?v=8ab2aa5a";
import { DifficultySection } from "./ui/DifficultySection.js?v=6c89367f";
import { ExtraModularSection } from "./ui/ExtraModularSection.js?v=f035682d";
import { HeroSection } from "./ui/HeroSection.js?v=de55b3dc";
import { ModularSection } from "./ui/ModularSection.js?v=fc01c0a7";
import { ScenarioSection } from "./ui/ScenarioSection.js?v=506dd0fb";
import { Settings } from "./ui/Settings.js?v=3f5a08f9";

const settingsButton = document.getElementById("settings");
const shuffleAllButton = document.getElementById("shuffle-all");
let lastClickedButton = null;

const settings = new Settings({
  maxNumberOfHeroes: 4,
  maxAllowedHeroicLevel: 3,
  maxNumberOfExtraModulars: 4,
});

// Sections added in shuffle order:
// Scenario → Hero → Aspect → Modular → Extra Modular → Difficulty

const sections = [];
const scenarioSection = new ScenarioSection(settings);
sections.push(scenarioSection);

const heroSections = [];
for (let n = 1; n <= settings.maxNumberOfHeroes; n++) {
  const heroSection = new HeroSection(settings, n);
  const aspectSection = new AspectSection(settings, n);
  heroSections.push(heroSection);
  sections.push(heroSection, aspectSection);
}

const modularSection = new ModularSection(settings);
const extraModularSection = new ExtraModularSection(settings);
const difficultySection = new DifficultySection(settings);
sections.push(modularSection, extraModularSection, difficultySection);

async function initialize() {
  if (tryUseBookmarkUrl(location.href)) {
    return;
  }
  await initializeStorage();
  await initializeBookmarks();
  initializeWindow();
  initializeGlobalButtons();
  initializeSettings();
  initializeSections();
  initializeDoubleSizedCards();
}

async function initializeBookmarks() {
  const createButton = document.getElementById("create-bookmark-url");
  createButton.addEventListener("click", async () => {
    const url = await createBookmarkUrl();
    bookmarkUrlElement.innerText = url;
  });
  const useButton = document.getElementById("use-bookmark-url");
  useButton.addEventListener("click", () => {
    const url = prompt("Paste your bookmark URL here. The page will reload.");
    const success = tryUseBookmarkUrl(url);
    if (!success) {
      alert("Invalid bookmark URL.");
    }
  });
  const copyButton = document.getElementById("copy-bookmark-url");
  copyButton.addEventListener("click", async () => {
    const url = await getBookmarkUrl();
    await navigator.clipboard.writeText(url);
    alert("Your bookmark URL has been copied to the clipboard.");
  });
  const clearButton = document.getElementById("clear-bookmark-url");
  clearButton.addEventListener("click", () => {
    const confirmed = confirm(
      "Your bookmark URL will be cleared from this browser. Click OK to confirm.",
    );
    if (confirmed) {
      clearUserId();
    }
  });
  const bookmarkUrlElement = document.getElementById("bookmark-url");
  bookmarkUrlElement.innerText = await getBookmarkUrl();
}

function initializeWindow() {
  window.addEventListener("keydown", () => {
    lastClickedButton = null;
  });
  window.addEventListener("mousedown", () => {
    lastClickedButton = null;
  });
  window.addEventListener("click", (event) => {
    lastClickedButton = event.target.tagName === "BUTTON" ? event.target : null;
  });
  window.addEventListener("submit", (event) => {
    event.preventDefault();
    toggleSettings();
  });
}

function initializeGlobalButtons() {
  shuffleAllButton.addEventListener("click", () => shuffleAll());
  settingsButton.addEventListener("click", () => toggleSettings());
}

function initializeSettings() {
  settings.initialize();
}

function initializeSections() {
  for (const section of sections) {
    section.addEventListener("shufflestart", () => {
      setGlobalButtonsAvailability();
    });
    section.addEventListener("shuffleend", () => {
      setGlobalButtonsAvailability();
      maybeReturnFocusAfterShuffle();
    });
    section.addEventListener("cardsupdated", () => {
      if (section.visible) {
        updateTrackingTable();
      }
    });
    section.initialize(sections);
  }
  settings.allSectionsInitialized = true;
  updateTrackingTable();
}

function initializeDoubleSizedCards() {
  for (const section of [scenarioSection, ...heroSections]) {
    const slot = section.slots[0];
    const sectionClassList = section.root.classList;
    const slotClassList = slot.root.classList;
    slot.root.addEventListener("click", () => {
      if (sectionClassList.contains("flipping")) {
        return;
      }
      if (slotClassList.contains("has-giant-form")) {
        sectionClassList.toggle("giant");
      } else if (slotClassList.contains("has-wide-form")) {
        sectionClassList.toggle("wide");
      }
    });
  }
}

function tryUseBookmarkUrl(url) {
  try {
    const userId = new URL(url).searchParams.get("id");
    if (!userId) {
      return false;
    }
    setUserId(userId.toString());
    location.href = location.origin + location.pathname; // Reload page without id override.
    return true;
  } catch {
    return false;
  }
}

function shuffleAll() {
  for (const section of sections) {
    section.shuffle({ isShuffleAll: true });
  }
}

function toggleSettings() {
  const settingsVisible = document.body.classList.toggle("show-settings");

  shuffleAllButton.disabled = settingsVisible;
  for (const section of sections) {
    section.button.disabled = settingsVisible;
  }

  if (settingsVisible) {
    settings.previouslyVisibleSections = getVisibleSections();
  } else {
    updateSectionVisibility();

    const newlyVisibleSections = filter(
      getVisibleSections(),
      settings.previouslyVisibleSections,
    );

    for (const section of newlyVisibleSections) {
      section.shuffle({ animate: false, isShuffleAll: true });
    }

    requestPostAnimationFrame(() => {
      for (const section of sections) {
        section.shuffleIfInvalid();
      }
    });

    updateTrackingTable();
  }
}

function getVisibleSections() {
  return sections.filter((section) => section.visible);
}

function updateSectionVisibility() {
  for (const section of sections) {
    section.updateVisibility();
  }
}

function updateTrackingTable() {
  if (!settings.allSectionsInitialized) {
    return;
  }

  const scenarios = scenarioSection.trueCards;
  const heroes = heroSections.flatMap((section) => section.trueCards);
  const difficulties = difficultySection.trueCards;

  renderTable([{ children: scenarios }], [{ children: heroes }], difficulties);
}

function setGlobalButtonsAvailability() {
  const disabled = sections.some((section) => section.disabled);
  shuffleAllButton.disabled = disabled;
  settingsButton.disabled = disabled;
}

function maybeReturnFocusAfterShuffle() {
  if (lastClickedButton && !lastClickedButton.disabled) {
    lastClickedButton.focus();
  }
}

await initialize();
setTimeout(() => document.body.classList.remove("init"), 100);
