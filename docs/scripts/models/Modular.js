import { Card } from "./Card.js?v=63ff8842";

export class Modular extends Card {
  constructor(
    name,
    {
      subname = null,
      isLandscape = false,
      hasBack = false,
      traits = [],
      isUncounted = false,
      requiredReason = null,
    } = {},
  ) {
    super(name, {
      subname,
      isLandscape,
      hasBack,
      traits,
      isUncounted,
      requiredReason,
    });
  }
}
