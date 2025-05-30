import { Model } from "./Model.js";

export class Campaign extends Model {
  constructor(cardSet) {
    super();
    this.slug = cardSet.slug.slice(0, -"-set".length);
    this.imageSrc = Model.buildImage(this.constructor, `${this.slug}.png`);
  }
}
