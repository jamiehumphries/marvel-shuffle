import { aspects } from "../cards.js?v=4416f240";
import { Section } from "./Section.js?v=55c1680f";

export class AspectSection extends Section {
  constructor(settings, parentSection, nthOfType) {
    super(settings, aspects, nthOfType, { parentSection });
  }
}
