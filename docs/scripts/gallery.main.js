import {
  aspects,
  difficulties,
  extraModulars,
  heroes,
  modulars,
  scenarios,
} from "./data/cards.js?v=057cf0da";
import { Campaign } from "./models/Campaign.js?v=1c1810ff";
import { Model } from "./models/Model.js?v=cf381a97";
import { flatten } from "./shared/helpers.js?v=f466f5fb";

const gallery = document.getElementById("gallery");
const cardTemplate = document.getElementById("card");

const params = new URLSearchParams(window.location.search);
const search = params.get("search");

const cardsByType = [
  scenarios,
  difficulties,
  modulars.concat(extraModulars),
  heroes,
  aspects,
].map((cardsOrSets) =>
  flatten(cardsOrSets)
    .filter(matchesQuery)
    .sort(
      (c1, c2) =>
        c1.name.localeCompare(c2.name) ||
        (c1.subname || "").localeCompare(c2.subname || ""),
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

function matchesQuery(cardOrSet) {
  if (!search) {
    return true;
  }
  if (cardOrSet === undefined) {
    return false;
  }
  return (
    Model.buildSlug(cardOrSet.name) === search || matchesQuery(cardOrSet.parent)
  );
}

function appendTitle(title, count) {
  const h2 = document.createElement("h2");
  h2.innerText = `${title} (${count})`;
  gallery.appendChild(h2);
}

function append(card, ...classes) {
  if (card.isLandscape) {
    classes.push("landscape");
  }
  if (card.hasI) {
    classes.push("has-i");
  }

  const element = cardTemplate.content.firstElementChild.cloneNode(true);
  const name = element.querySelector(".name");
  const subname = element.querySelector(".subname");
  const back = element.querySelector(".back");
  const front = element.querySelector(".front");

  name.innerText = card.name;
  subname.innerText = card.subname;
  back.src = card.backSrc;
  front.src = card.frontSrc;
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
  const placeholderSides = [];
  if (card.frontSrc === card.type.placeholderImageSrc) {
    placeholderSides.push("front");
  }
  if (card.hasBack && card.backSrc === card.type.placeholderImageSrc) {
    placeholderSides.push("back");
  }

  if (placeholderSides.length > 0) {
    console.log(
      `%c ${card.name} (${card.type.name}) is using a placeholder image` +
        ` for its ${placeholderSides.join(" and ")} side`,
      "color: red",
    );
  }

  return placeholderSides.map((side) => `placeholder-${side}`);
}
