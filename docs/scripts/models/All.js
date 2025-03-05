import { Option } from "./Option.js?v=ec367d18";

export class All extends Option {
  constructor(section) {
    const name = `All ${section.type.namePlural}`;
    const type = section.type;
    const children = section.cardsOrSets;
    super(name, { type, children });
  }

  appendTo(element) {
    super.appendTo(element, "all");
  }
}
