import { heroes, scenarios } from "./data/cards.js?v=9a2e587a";
import { initializeStorage } from "./data/storage.js?v=e77ff9b5";
import { renderTable } from "./data/tracker.js?v=abb8ad52";

await initializeStorage();
renderTable(scenarios, heroes);
