import { image } from "../helpers.js?v=b2f4ffde";
import { SluggedObject } from "./SluggedObject.js?v=45040447";

export class Campaign extends SluggedObject {
  constructor(cardSet) {
    super();
    this.slug = cardSet.slug.slice(0, -"-set".length);
    this.imageSrc = image(this.constructor, `${this.slug}.png`);
  }
}
