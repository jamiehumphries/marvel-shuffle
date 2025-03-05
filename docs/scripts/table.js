import { heroes, scenarios } from "./data/cards.js?v=2121f86f";
import { initializeStorage } from "./data/storage.js?v=62f5cba1";
import { renderTable } from "./data/tracker.js?v=8c47738d";

await initializeStorage();
renderTable(scenarios, heroes);
