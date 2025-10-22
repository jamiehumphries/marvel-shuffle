import { Card } from "./Card.js?v=60b28596";

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
