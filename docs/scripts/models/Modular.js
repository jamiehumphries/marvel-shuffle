import { Card } from "./Card.js?v=2e6561da";

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
