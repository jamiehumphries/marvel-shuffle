const rollAllButton = document.getElementById("roll-all");
const features = {};

configureFeature("villain", true, [
  "klaw",
  "rhino",
  "ultron"
]);

configureFeature("module", true, [
  "bomb-scare",
  "legions-of-hydra",
  "the-doomsday-chair",
  "the-masters-of-evil",
  "under-attack"
]);

configureFeature("hero", false, [
  "black-panther",
  "captain-marvel",
  "iron-man",
  "she-hulk",
  "spider-man"
]);

configureFeature("aspect", true, [
  "aggression",
  "justice",
  "leadership",
  "protection"
]);

function configureFeature(name, hasGenericCardBack, options) {
  const feature = document.getElementById(name);
  const card = feature.querySelector(".card");
  const button = getButton(card);
  button.addEventListener("click", () => roll(name, true));
  features[name] = { card, hasGenericCardBack, options, button };
}

function getButton(card) {
  return card.parentElement.querySelector("button");
}

function roll(featureName, preventRepeat = false) {
  const feature = features[featureName];
  const { card, button } = feature;
  const choice = pickFrom(feature.options);
  const front = card.querySelector("img.front");
  const newFrontSrc = `images/${featureName}/${choice}/front.png`;
  if (preventRepeat && front.src.endsWith(newFrontSrc)) {
    roll(featureName, true);
    return;
  }
  button.disabled = true;
  toggleRollAllButton();
  card.classList.add("flipping");
  setTimeout(() => {
    front.src = newFrontSrc;
    if (!feature.hasGenericCardBack) {
      const back = card.querySelector("img.back");
      const newBackSrc = `images/${featureName}/${choice}/back.png`;
      back.src = newBackSrc;
    }
  }, 500);
}

function pickFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function onCardFlipped(event) {
  const card = event.currentTarget;
  card.classList.add("flipped");
  card.classList.remove("flipping");
  setTimeout(() => {
    card.classList.remove("flipped");
    getButton(card).disabled = false;
    toggleRollAllButton();
  }, 0);
}

function toggleRollAllButton() {
  rollAllButton.disabled = Object.values(features).some(f => f.button.disabled);
}

for (const card of Object.values(features).map(f => f.card)) {
  card.addEventListener("transitionend", onCardFlipped);
}

rollAllButton.addEventListener("click", () => {
  for (const feature of Object.keys(features)) {
    roll(feature);
  }
});
