import { Model } from "./Model.js?v=e8bcf0fa";

export class Campaign extends Model {
  constructor(cardSet) {
    super();
    this.slug = cardSet.slug.slice(0, -"-set".length);
    this.imageSrc = Model.buildImage(this.constructor, this.slug);
  }
}
