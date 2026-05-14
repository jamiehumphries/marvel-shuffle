import { Card } from "./Card.js";

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
      schemeDefaultModulars = null,
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
    this.isScheme = schemeDefaultModulars !== null;
    this.schemeDefaultModulars = schemeDefaultModulars;
  }
}
