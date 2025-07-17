import { Card } from "./Card.js?v=5f9e758a";

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
}
