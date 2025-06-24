import { Card } from "./Card.js?v=23473083";

export class Aspect extends Card {
  constructor(name, { required = [] } = {}) {
    const requiredChildCards = required;
    super(name, { requiredChildCards });
  }
}
