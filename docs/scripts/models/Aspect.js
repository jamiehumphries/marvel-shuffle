import { Card } from "./Card.js?v=3641cd0d";

export class Aspect extends Card {
  constructor(name, { required = [] } = {}) {
    const requiredChildCards = required;
    super(name, { requiredChildCards });
  }
}
