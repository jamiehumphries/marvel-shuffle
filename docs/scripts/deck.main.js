import { heroes } from "./data/cards.js?v=cbf2d4b6";
import { deck } from "./data/deck.js?v=c3812806";
import {
  BASIC,
  canIncludeSuggestedCard,
  flatten,
} from "./helpers.js?v=f466f5fb";
import { Model } from "./models/Model.js?v=b19a6e7e";

const gallery = document.getElementById("gallery");
const cardTemplate = document.getElementById("suggested-card");

const cardsByType = Object.groupBy(deck, (card) => card.aspect);

const params = new URLSearchParams(window.location.search);
const pack = getPack();
const hero = getHero();
const allowedAspects = getAllowedAspects();

if (hero) {
  const heroImg = document.createElement("img");
  heroImg.classList.add("hero");
  heroImg.src = hero.frontSrc;
  heroImg.alt = "";
  gallery.append(heroImg);
}

for (const [title, cards] of Object.entries(cardsByType)) {
  const matchedCards = cards
    .filter(matchesQuery)
    .sort(
      (c1, c2) =>
        c1.name.localeCompare(c2.name) ||
        (c1.subname || "").localeCompare(c2.subname || ""),
    );

  if (matchedCards.length === 0) {
    continue;
  }

  appendTitle(title, matchedCards.length);

  const group = document.createElement("div");
  group.classList.add("group");
  gallery.append(group);

  for (const card of matchedCards) {
    append(card, group);
  }
}

function getPack() {
  return params.get("pack");
}

function getHero() {
  const query = params.get("hero");
  if (!query) {
    return null;
  }
  const cards = flatten(heroes);
  return (
    cards.find((card) => Model.buildSlug(card.name, card.subname) === query) ||
    cards.find((card) => Model.buildSlug(card.name) === query)
  );
}

function getAllowedAspects() {
  const allAspects = Object.keys(cardsByType);
  const query = params.get("aspects");
  if (!query) {
    return allAspects;
  }
  const subqueries = query.split(",");
  const matches = allAspects.filter((aspect) =>
    subqueries.includes(Model.buildSlug(aspect)),
  );
  return hero ? matches.concat(BASIC) : matches;
}

function appendTitle(title, count) {
  const h2 = document.createElement("h2");
  h2.innerText = `${title} (${count})`;
  gallery.appendChild(h2);
}

function matchesQuery(card) {
  return matchesPack(card) && matchesHeroAndAspects(card);
}

function matchesPack(card) {
  if (!pack) {
    return true;
  }
  return card.packs.map((name) => Model.buildSlug(name)).includes(pack);
}

function matchesHeroAndAspects(card) {
  return hero
    ? canIncludeSuggestedCard(card, hero, allowedAspects)
    : allowedAspects.includes(card.aspect);
}

function append(card, group) {
  const element = cardTemplate.content.firstElementChild.cloneNode(true);

  const img = element.querySelector("img");
  const nameAndSubname = element.querySelector(".name-and-subname");
  const name = element.querySelector(".name");
  const subname = element.querySelector(".subname");
  const aspect = element.querySelector(".aspect");
  const type = element.querySelector(".type");

  element.href = card.href;
  img.src = card.imgSrc;
  img.classList.toggle("landscape", card.isLandscape);
  nameAndSubname.classList.toggle("has-i", card.hasI);
  name.innerText = card.name;
  subname.innerText = card.subname ? `(${card.subname})` : "";
  aspect.classList.add(card.aspectCode);
  aspect.innerText = card.aspect;
  type.innerText = card.type;

  group.appendChild(element);
}
