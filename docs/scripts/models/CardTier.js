export class CardTier {
  constructor(cards, { isOrdered = false, isRequired = false } = {}) {
    this.cards = cards || [];
    this.isOrdered = isOrdered;
    this.isRequired = isRequired;
  }
}
