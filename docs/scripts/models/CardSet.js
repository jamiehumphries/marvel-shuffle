import { Option } from "./Option.js?v=ec367d18";

export class CardSet extends Option {
  constructor(name, cards, isCampaign) {
    const type = cards[0].constructor;
    const slugModifier = "set";
    const children = cards;
    super(name, { type, slugModifier, children });
    this.isCampaign = isCampaign;
  }

  appendTo(element) {
    super.appendTo(element, "set");
    for (const card of this.children) {
      card.appendTo(element, "set-member");
    }
  }
}
