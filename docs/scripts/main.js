import {
  aspects,
  extraModulars,
  heroes,
  modulars,
  scenarios,
} from "./cards.js?v=4416f240";
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

const settingsButton = document.getElementById("settings");
const shuffleAllButton = document.getElementById("shuffle-all");
const createBookmarkUrlButton = document.getElementById("create-bookmark-url");
const useBookmarkUrlButton = document.getElementById("use-bookmark-url");
const copyBookmarkUrlButton = document.getElementById("copy-bookmark-url");
const clearBookmarkUrlButton = document.getElementById("clear-bookmark-url");
const bookmarkUrlElement = document.getElementById("bookmark-url");

let lastClickedButton = null;

const settings = new Settings();

const scenarioSection = new ScenarioSection(settings, scenarios, 1);
const modularSection = new ModularSection(settings, modulars, 1, {
  extraCards: extraModulars,
  parentSection: scenarioSection,
});
const extraModularSection = new ExtraModularSection(settings, modulars, 2, {
  previousSiblingSection: modularSection,
});
const heroSection1 = new HeroSection(settings, heroes, 1, {
  scenarioSection,
});
const aspectSection1 = new AspectSection(settings, aspects, 1, {
  parentSection: heroSection1,
});
const heroSection2 = new HeroSection(settings, heroes, 2, {
  previousSiblingSection: heroSection1,
  scenarioSection,
});
const aspectSection2 = new AspectSection(settings, aspects, 2, {
  parentSection: heroSection2,
});
const heroSection3 = new HeroSection(settings, heroes, 3, {
  previousSiblingSection: heroSection2,
  scenarioSection,
});
const aspectSection3 = new AspectSection(settings, aspects, 3, {
  parentSection: heroSection3,
});
const heroSection4 = new HeroSection(settings, heroes, 4, {
  previousSiblingSection: heroSection3,
  scenarioSection,
});
const aspectSection4 = new AspectSection(settings, aspects, 4, {
  parentSection: heroSection4,
});

const sections = [
  scenarioSection,
  modularSection,
  extraModularSection,
  heroSection1,
  aspectSection1,
  heroSection2,
  aspectSection2,
  heroSection3,
  aspectSection3,
  heroSection4,
  aspectSection4,
];

const heroSections = sections.filter(
  (section) => section.constructor === HeroSection,
);

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

function toggleHeroSectionVisibility() {
  for (let i = 0; i < heroSections.length; i++) {
    const heroSection = heroSections[i];
    heroSection.toggleVisibility(i < settings.numberOfHeroes);
  }
}

function updateTrackingTable() {
  const scenariosReady = scenarioSection.cards.length > 0;

  const visibleHeroSections = heroSections.filter((section) => section.visible);
  const heroesReady = visibleHeroSections.every(
    (section) => section.cards.length > 0,
  );

  if (!scenariosReady || !heroesReady) {
    return;
  }

  if (settings.anyDifficultiesTracked) {
    const scenarioSet = { children: scenarioSection.cards };
    const heroSet = {
      children: visibleHeroSections.flatMap((section) => section.cards),
    };
    renderTable([scenarioSet], [heroSet]);
  } else {
    clearTable();
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

async function initialize() {
  if (tryUseBookmarkUrl(location.href)) {
    return;
  }

  window.addEventListener("keydown", () => {
    lastClickedButton = null;
  });

  window.addEventListener("mousedown", () => {
    lastClickedButton = null;
  });

  window.addEventListener("click", (event) => {
    lastClickedButton = event.target.tagName === "BUTTON" ? event.target : null;
  });

  shuffleAllButton.addEventListener("click", () => shuffleAll());

  settingsButton.addEventListener("click", () => toggleSettings());

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

    section.addEventListener("cardsupdated", () => updateTrackingTable());
  }

  createBookmarkUrlButton.addEventListener("click", async () => {
    const url = await createBookmarkUrl();
    bookmarkUrlElement.innerText = url;
  });

  useBookmarkUrlButton.addEventListener("click", () => {
    const url = prompt("Paste your bookmark URL here. The page will reload.");
    const success = tryUseBookmarkUrl(url);
    if (!success) {
      alert("Invalid bookmark URL.");
    }
  });

  copyBookmarkUrlButton.addEventListener("click", async () => {
    const url = await getBookmarkUrl();
    await navigator.clipboard.writeText(url);
    alert("Your bookmark URL has been copied to the clipboard.");
  });

  clearBookmarkUrlButton.addEventListener("click", () => {
    const confirmed = confirm(
      "Your bookmark URL will be cleared from this browser. Click OK to confirm.",
    );
    if (confirmed) {
      clearUserId();
    }
  });

  await initializeStorage();
  const bookmarkUrl = await getBookmarkUrl();
  bookmarkUrlElement.innerText = bookmarkUrl;

  settings.initialize();
  toggleHeroSectionVisibility();

  for (const section of sections) {
    section.initialize();
  }

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

await initialize();
setTimeout(() => document.body.classList.remove("init"), 100);
