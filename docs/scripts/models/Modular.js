import { Card } from "./Card.js?v=3858d6c7";

export class Modular extends Card {
  constructor(
    name,
    {
      isLandscape = false,
      hasBack = false,
      traits = [],
      isUncounted = false,
      requiredModifier = null,
    } = {},
  ) {
    super(name, {
      isLandscape,
      hasBack,
      traits,
      isUncounted,
      requiredModifier,
    });
  }

  static get placeholder() {
    return (this._placeholder ||= new this("No modulars needed"));
  }
}
