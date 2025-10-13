import {
  aspects,
  difficulties,
  extraModulars,
  heroes,
  modulars,
  scenarios,
} from "./data/cards.js?v=aa9a1f37";
import { flatten } from "./helpers.js?v=85ee0a71";
import { Campaign } from "./models/Campaign.js?v=18e69d87";
import { Model } from "./models/Model.js?v=a4032d95";

const gallery = document.getElementById("gallery");
const cardTemplate = document.getElementById("card");

const params = new URLSearchParams(window.location.search);
const search = params.get("s");

const cardsByType = [
  scenarios,
  difficulties,
  modulars.concat(extraModulars),
  heroes,
  aspects,
].map((cardsOrSets) =>
  flatten(cardsOrSets)
    .filter(matchesSearch)
    .sort(
      (c1, c2) =>
        c1.name.localeCompare(c2.name) || c1.subname.localeCompare(c2.subname),
    ),
);

for (const cards of cardsByType) {
  if (cards.length === 0) {
    continue;
  }
  appendTitle(cards[0].type.namePlural, cards.length);
  for (const card of cards) {
    append(card, ...getPlaceholderUsageClasses(card));
    if (card.hasGiantForm || card.hasWideForm) {
      appendInner(card);
    }
  }
}

if (search === null) {
  const campaignSets = scenarios.filter((set) => set.isCampaign);
  appendTitle("Campaigns", campaignSets.length);
  for (const set of campaignSets) {
    const frontSrc = new Campaign(set).imageSrc;
    const backSrc = "";
    const isLandscape = false;
    append({ ...set, frontSrc, backSrc, isLandscape }, "campaign");
  }
}

function matchesSearch(cardOrSet) {
  if (!search) {
    return true;
  }
  if (cardOrSet === undefined) {
    return false;
  }
  return (
    Model.buildSlug(cardOrSet.name) === search ||
    matchesSearch(cardOrSet.parent)
  );
}

function appendTitle(title, count) {
  const h2 = document.createElement("h2");
  h2.innerText = `${title} (${count})`;
  gallery.appendChild(h2);
}

function append({ name, subname, frontSrc, backSrc, isLandscape }, ...classes) {
  if (isLandscape) {
    classes = classes.concat("landscape");
  }

  const element = cardTemplate.content.firstElementChild.cloneNode(true);
  element.querySelector(".name").innerText = name;
  element.querySelector(".subname").innerText = subname;
  element.querySelector(".back").src = backSrc;
  element.querySelector(".front").src = frontSrc;
  element.classList.add(...classes);

  gallery.appendChild(element);
}

function appendInner(card) {
  const name = `${card.name} *`;
  const frontSrc = card.frontInnerSrc;
  const backSrc = card.backInnerSrc;
  const isLandscape = card.hasGiantForm;
  append({ ...card, name, frontSrc, backSrc, isLandscape }, "inner");
}

function getPlaceholderUsageClasses(card) {
  const classes = [];

  const placeholderUsage = {
    front: card.frontSrc === card.type.placeholderImageSrc,
    back: card.hasBack && card.backSrc === card.type.placeholderImageSrc,
  };

  for (const [side, isPlaceholder] of Object.entries(placeholderUsage)) {
    if (!isPlaceholder) {
      continue;
    }
    classes.push(`placeholder-${side}`);
    console.log(
      `%c "${card.name}" (${card.type.name}) is using a placeholder ${side} image.`,
      "color: red",
    );
  }

  return classes;
}
