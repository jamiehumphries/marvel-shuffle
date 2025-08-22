import { Card } from "./Card.js";

export class Modular extends Card {
  constructor(
    name,
    {
      subname = null,
      optionSubname = null,
      isLandscape = false,
      hasBack = false,
      traits = [],
      isUncounted = false,
      requiredReason = null,
    } = {},
  ) {
    super(name, {
      subname,
      optionSubname,
      isLandscape,
      hasBack,
      traits,
      isUncounted,
      requiredReason,
    });
  }
}
