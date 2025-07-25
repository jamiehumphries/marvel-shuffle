import {
  aspects,
  difficulties,
  extraModulars,
  heroes,
  modulars,
  scenarios,
} from "./data/cards.js?v=34086cf3";
import { flatten } from "./helpers.js?v=7cb83087";

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
    const element = cardTemplate.content.cloneNode(true);

    const title = element.querySelector(".title");
    title.innerText = card.name;

    const back = element.querySelector(".back");
    back.src = card.backSrc;

    const front = element.querySelector(".front");
    front.src = card.frontSrc;

    gallery.appendChild(element);
  }
}
