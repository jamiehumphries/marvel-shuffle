import {
  aspects,
  difficulties,
  extraModulars,
  heroes,
  modulars,
  scenarios,
} from "./data/cards.js";
import { flatten } from "./helpers.js";

const gallery = document.getElementById("gallery");
const cardTemplate = document.getElementById("card");

const cardsByType = [
  scenarios,
  difficulties,
  modulars.concat(extraModulars),
  heroes,
  aspects,
].map((cardsOrSets) =>
  flatten(cardsOrSets).sort(
    (c1, c2) =>
      c1.name.localeCompare(c2.name) || c1.subname.localeCompare(c2.subname),
  ),
);

for (const cards of cardsByType) {
  const h2 = document.createElement("h2");
  h2.innerText = cards[0].type.namePlural;
  gallery.appendChild(h2);

  for (const card of cards) {
    append(card);
    if (card.hasGiantForm || card.hasWideForm) {
      appendInner(card);
    }
  }
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
  append({ ...card, name, frontSrc, backSrc, isLandscape }, "double-size");
}
