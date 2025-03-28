import { Card } from "./Card.js?v=f858f47e";

export class Aspect extends Card {
  constructor(name, { required = [] } = {}) {
    const requiredChildCards = required;
    super(name, { requiredChildCards });
  }
}
