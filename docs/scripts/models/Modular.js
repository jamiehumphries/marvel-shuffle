import { Card } from "./Card.js?v=f858f47e";

export class Modular extends Card {
  constructor(
    name,
    {
      isLandscape = false,
      hasBack = false,
      traits = [],
      isUncounted = false,
      requiredReason = null,
    } = {},
  ) {
    super(name, {
      isLandscape,
      hasBack,
      traits,
      isUncounted,
      requiredReason,
    });
  }

  static get placeholder() {
    return (this._placeholder ||= new this("No modulars needed"));
  }
}
