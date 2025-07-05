import { Option } from "./Option.js";

export class CardSet extends Option {
  constructor(name, cards, isCampaign) {
    const type = cards[0].constructor;
    const slugModifier = "set";
    const children = cards;
    super(name, { type, slugModifier, children });
    this.isCampaign = isCampaign;
    this.extraOptions = [];
  }

  get suboptions() {
    return super.suboptions.concat(this.extraOptions);
  }

  appendTo(element, ...classes) {
    super.appendTo(element, ...classes, "set");
    for (const option of this.suboptions) {
      option.appendTo(element, "set-member");
    }
  }

  withExtraOptions(...options) {
    this.extraOptions = options;
    for (const option of options) {
      option.parent = this;
    }
    return this;
  }
}
