import { aspects } from "../data/cards.js?v=2121f86f";
import { Section } from "./Section.js?v=973f83f6";

export class AspectSection extends Section {
  constructor(settings, nthOfType) {
    super(settings, aspects, nthOfType);
  }
}
