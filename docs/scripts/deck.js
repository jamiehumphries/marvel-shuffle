import { aspects, heroes } from "./data/cards.js";
import { deck } from "./data/deck.js";
import { BASIC, canIncludeSuggestedCard, flatten } from "./helpers.js";
import { Model } from "./models/Model.js";

const gallery = document.getElementById("gallery");
const cardTemplate = document.getElementById("suggested-card");

const params = new URLSearchParams(window.location.search);
const pack = getPack();
const hero = getHero();
const allowedAspects = getAllowedAspects()
  .map((card) => card.name)
  .concat(BASIC);

const cardsByType = Object.groupBy(deck, (card) => card.aspect);

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
  return query ? findMatch(query, heroes) : null;
}

function getAllowedAspects() {
  const query = params.get("aspects");
  if (!query) {
    return flatten(aspects);
  }
  const subqueries = query.split(",");
  const matches = subqueries
    .map((subquery) => findMatch(subquery, aspects))
    .filter((match) => !!match);
  return matches.length > 0 ? matches : flatten(aspects);
}

function findMatch(query, set) {
  const cards = flatten(set);
  return (
    cards.find((card) => Model.buildSlug(card.name, card.subname) === query) ||
    cards.find((card) => Model.buildSlug(card.name) === query)
  );
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
