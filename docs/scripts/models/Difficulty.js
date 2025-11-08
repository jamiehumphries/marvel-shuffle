import { Card } from "./Card.js?v=2e6561da";

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
