import { Card } from "./Card.js?v=3858d6c7";

export class Difficulty extends Card {
  constructor(name) {
    const isStandard = name.startsWith("Standard");
    super(name, { isUncounted: !isStandard });
    this.isStandard = isStandard;
  }

  static get namePlural() {
    return "Difficulties";
  }
}
