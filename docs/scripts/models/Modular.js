import { Card } from "./Card.js?v=3641cd0d";

export class Modular extends Card {
  constructor(
    name,
    {
      subname = null,
      modifier = null,
      isLandscape = false,
      hasBack = false,
      linked = [],
      traits = [],
      isUncounted = false,
      requiredReason = null,
    } = {},
  ) {
    const linkedCards = linked;
    super(name, {
      subname,
      modifier,
      isLandscape,
      hasBack,
      linkedCards,
      traits,
      isUncounted,
      requiredReason,
    });
  }
}
