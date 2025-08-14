import { Card } from "./Card.js?v=cdc7a5fc";

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
