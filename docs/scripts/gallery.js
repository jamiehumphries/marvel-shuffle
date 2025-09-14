import {
  aspects,
  difficulties,
  extraModulars,
  heroes,
  modulars,
  scenarios,
} from "./data/cards.js";
import { flatten } from "./helpers.js";
import { Campaign } from "./models/Campaign.js";
import { Model } from "./models/Model.js";

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
    append(card);
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
