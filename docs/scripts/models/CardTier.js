export class CardTier {
  constructor(cards, { isOrdered = false, ignoreExclude = false } = {}) {
    this.cards = cards;
    this.isOrdered = isOrdered;
    this.ignoreExclude = ignoreExclude;
  }
}
