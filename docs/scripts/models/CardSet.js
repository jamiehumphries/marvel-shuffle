import { flatten } from "../helpers.js?v=13f1a7fe";
import { Option } from "./Option.js?v=269067dc";

export class CardSet extends Option {
  constructor(name, cards, { isCampaign = false, parentSetSlug = null }) {
    const type = flatten(cards)[0].constructor;
    const slugModifier = parentSetSlug ? `${parentSetSlug}-set` : "set";
    const children = cards;
    super(name, { type, slugModifier, children });
    this.isCampaign = isCampaign;
    this.extraOptions = [];
  }

  get allCards() {
    return (this._allCards ||= flatten(this.children));
  }

  get suboptions() {
    return (this._suboptions ||= super.suboptions.concat(this.extraOptions));
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
