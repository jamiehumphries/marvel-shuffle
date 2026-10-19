import { Card } from "./Card.js?v=14b4d704";

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
