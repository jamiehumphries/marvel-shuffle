import { Card } from "./Card.js?v=0caf332c";

export class Aspect extends Card {
  constructor(name, { required = [] } = {}) {
    const requiredChildCards = required;
    super(name, { requiredChildCards });
  }
}
