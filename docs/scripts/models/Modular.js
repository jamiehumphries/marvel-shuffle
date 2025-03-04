import { Card } from "./Card.js?v=66e17b27";

export class Modular extends Card {
  constructor(
    name,
    { isLandscape = false, hasBack = false, traits = [] } = {},
  ) {
    super(name, { isLandscape, hasBack, traits });
  }

  static get placeholder() {
    return (this._placeholder ||= new this("No modulars needed"));
  }
}
