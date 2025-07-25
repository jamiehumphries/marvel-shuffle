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
  flatten(cardsOrSets).sort((c1, c2) => c1.name.localeCompare(c2.name)),
);

for (const cards of cardsByType) {
  const h2 = document.createElement("h2");
  h2.innerText = cards[0].type.namePlural;
  gallery.appendChild(h2);

  for (const card of cards) {
    appendCard(card);

    if (card.hasGiantForm || card.hasWideForm) {
      const name = `${card.name} (inner)`;
      const frontSrc = card.frontInnerSrc;
      const backSrc = card.backInnerSrc;
      appendCard({ name, frontSrc, backSrc }, "double-size");
    }
  }
}

function appendCard({ name, frontSrc, backSrc }, ...classes) {
  const element = cardTemplate.content.firstElementChild.cloneNode(true);

  const title = element.querySelector(".title");
  title.innerText = name;

  const back = element.querySelector(".back");
  back.src = backSrc;

  const front = element.querySelector(".front");
  front.src = frontSrc;

  element.classList.add(...classes);

  gallery.appendChild(element);
}
