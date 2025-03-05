import { hashes } from "../data/hashes.js?v=0d91b12f";

export class Model {
  static get slug() {
    return (this._slug ||= this.buildSlug(this.name));
  }

  static buildSlug(...names) {
    return names
      .join()
      .toLowerCase()
      .replaceAll(/[’\.]/g, "") // Remove apostrophes and full stops.
      .replaceAll(/[^a-zA-Z0-9]+/g, "-") // Replace all non-word characters with "-".
      .replaceAll(/(^\-+|\-+$)/g, ""); // Strip any leading and trailing "-".
  }

  static buildImage(type, ...pathParts) {
    const path = ["/images", type.slug, ...pathParts].join("/");
    const hash = hashes[path];
    return hash ? `${path}?v=${hash}` : type.placeholderImageSrc;
  }
}
