import { Card } from "./Card.js?v=3858d6c7";

export class Difficulty extends Card {
  constructor(name) {
    super(name);
    this.isStandard = name.startsWith("Standard");
  }

  static get namePlural() {
    return "Difficulties";
  }
}
