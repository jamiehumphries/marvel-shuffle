import { Option } from "./Option.js?v=f6da124b";

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
