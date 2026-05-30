import { Card } from "./Card.js?v=34d196b9";

export class Aspect extends Card {
  constructor(name, { required = [] } = {}) {
    const requiredChildCards = required;
    super(name, { requiredChildCards });
  }
}
