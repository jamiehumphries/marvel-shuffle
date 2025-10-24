import { requestPostAnimationFrame } from "../helpers.js?v=13f1a7fe";
import { Toggleable } from "./Toggleable.js?v=8474d19e";

export class Slot extends Toggleable {
  constructor(root) {
    super();
    this.root = root;
    this.header = root.querySelector(".header");
    this.name = root.querySelector(".name");
    this.subname = root.querySelector(".subname");
    this.cardFront = root.querySelector(".front img.front");
    this.cardFrontInner = root.querySelector(".front img.back");
    this.cardBack = root.querySelector(".back img.front");
    this.cardBackInner = root.querySelector(".back img.back");
    this.requiredReason = root.querySelector(".required-modifier");
  }

  get card() {
    return this._card;
  }

  set card(value) {
    const newCard = value;
    this._card = newCard;

    if (!newCard) {
      this.hide();
      return;
    }

    this.show();

    this.root.classList.toggle("landscape", newCard.isLandscape);
    this.root.classList.toggle("has-i", newCard.hasI);
    this.root.classList.toggle("has-giant-form", newCard.hasGiantForm);
    this.root.classList.toggle("has-wide-form", newCard.hasWideForm);

    this.cardFront.src = newCard.frontSrc;
    this.cardBack.src = newCard.backSrc;
    this.cardFrontInner.src = newCard.frontInnerSrc || "";
    this.cardBackInner.src = newCard.backInnerSrc || "";

    // Replacing the name elements entirely fixes some animation bugs
    // which were happening when just replacing the text.
    this.name.remove();
    this.name = this.name.cloneNode(true);
    this.name.innerText = newCard.name;

    this.subname.remove();
    this.subname = this.subname.cloneNode(true);
    this.subname.innerText = newCard.subname;

    requestPostAnimationFrame(() =>
      this.header.prepend(this.name, this.subname),
    );
  }
}
