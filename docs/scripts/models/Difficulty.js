import { Card } from "./Card.js?v=3858d6c7";

export const STANDARD = "standard";
export const EXPERT = "expert";

export class Difficulty extends Card {
  constructor(name) {
    super(name);
    this.level = name.split(" ")[0].toLowerCase();
  }

  static get namePlural() {
    return "Difficulties";
  }
}
