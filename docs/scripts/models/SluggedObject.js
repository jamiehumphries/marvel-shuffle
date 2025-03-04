import { getSlug } from "../helpers.js?v=b2f4ffde";

export class SluggedObject {
  static get slug() {
    return (this._slug ||= getSlug(this.name));
  }
}
