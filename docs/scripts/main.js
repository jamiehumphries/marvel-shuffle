import { filter, requestPostAnimationFrame } from "./helpers.js?v=b2f4ffde";
import {
  clearUserId,
  createBookmarkUrl,
  getBookmarkUrl,
  initializeStorage,
  setUserId,
} from "./storage.js?v=b419bdb4";
import { clearTable, renderTable } from "./tracker.js?v=bcc2ce19";
import { AspectSection } from "./ui/AspectSection.js?v=93cf8ddc";
import { ExtraModularSection } from "./ui/ExtraModularSection.js?v=cf19b921";
import { HeroSection } from "./ui/HeroSection.js?v=32568e42";
import { ModularSection } from "./ui/ModularSection.js?v=49d39ed5";
import { ScenarioSection } from "./ui/ScenarioSection.js?v=bdfd3080";
import { Settings } from "./ui/Settings.js?v=03b42f08";

const NUMBER_OF_HERO_SECTIONS = 4;

const settingsButton = document.getElementById("settings");
const shuffleAllButton = document.getElementById("shuffle-all");
let lastClickedButton = null;

const settings = new Settings(NUMBER_OF_HERO_SECTIONS);

const sections = [];
const scenarioSection = new ScenarioSection(settings);
const modularSection = new ModularSection(settings, scenarioSection);
const extraModularSection = new ExtraModularSection(settings, modularSection);
sections.push(scenarioSection, modularSection, extraModularSection);

const heroSections = [];
for (let n = 1; n <= NUMBER_OF_HERO_SECTIONS; n++) {
  const previous = heroSections[heroSections.length - 1];
  const heroSection = new HeroSection(settings, previous, scenarioSection, n);
  const aspectSection = new AspectSection(settings, heroSection, n);
  sections.push(heroSection, aspectSection);
  heroSections.push(heroSection);
}

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
}

function initializeGlobalButtons() {
  shuffleAllButton.addEventListener("click", () => shuffleAll());
  settingsButton.addEventListener("click", () => toggleSettings());
}

function initializeSettings() {
  settings.initialize();
  toggleHeroSectionVisibility();
}

function initializeSections() {
  for (const section of sections) {
    section.root.addEventListener("submit", (event) => {
      event.preventDefault();
      toggleSettings();
    });
    section.addEventListener("shufflestart", () => {
      setGlobalButtonsAvailability();
    });
    section.addEventListener("shuffleend", () => {
      setGlobalButtonsAvailability();
      maybeReturnFocusAfterShuffle();
    });
    section.addEventListener("cardsupdated", () => {
      updateTrackingTable();
    });
    section.initialize();
  }
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
    toggleHeroSectionVisibility();

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

function toggleHeroSectionVisibility() {
  for (let i = 0; i < heroSections.length; i++) {
    const heroSection = heroSections[i];
    heroSection.toggleVisibility(i < settings.numberOfHeroes);
  }
}

function updateTrackingTable() {
  if (!scenarioSection.initialized) {
    return;
  }

  const visibleHeroSections = heroSections.filter((section) => section.visible);
  if (!visibleHeroSections.every((section) => section.initialized)) {
    return;
  }

  if (settings.anyDifficultiesTracked) {
    const scenarios = scenarioSection.cards;
    const heroes = visibleHeroSections.flatMap((section) => section.cards);
    renderTable([{ children: scenarios }], [{ children: heroes }]);
  } else {
    clearTable();
  }
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
