import { Card } from "./Card.js?v=af1a41d7";

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
