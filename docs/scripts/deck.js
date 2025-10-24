import { deck } from "./data/deck.js";

const gallery = document.getElementById("gallery");
const cardTemplate = document.getElementById("suggested-card");

const cardsByType = Object.groupBy(deck, (card) => card.aspect);

for (const [title, cards] of Object.entries(cardsByType)) {
  appendTitle(title, cards.length);
  cards.sort((c1, c2) => {
    return (
      c1.name.localeCompare(c2.name) ||
      (c1.subname || "").localeCompare(c2.subname || "")
    );
  });
  for (const card of cards) {
    append(card);
  }
}

function append({
  name,
  subname,
  aspect,
  aspectCode,
  type,
  imgSrc,
  hasI,
  isLandscape,
}) {
  const element = cardTemplate.content.firstElementChild.cloneNode(true);
  element.querySelector(".name-and-subname").classList.toggle("has-i", hasI);
  element.querySelector(".name").innerText = name;
  element.querySelector(".subname").innerText = subname ? `(${subname})` : "";

  const aspectElement = element.querySelector(".aspect");
  aspectElement.innerText = aspect;
  aspectElement.classList.add(aspectCode);

  element.querySelector(".type").innerText = type;

  const img = element.querySelector("img");
  img.src = imgSrc;
  img.classList.toggle("landscape", isLandscape);

  gallery.appendChild(element);
}

function appendTitle(title, count) {
  const h2 = document.createElement("h2");
  h2.innerText = `${title} (${count})`;
  gallery.appendChild(h2);
}
