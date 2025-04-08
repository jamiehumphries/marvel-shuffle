import { heroes, scenarios } from "./data/cards.js?v=95126b2d";
import { initializeStorage } from "./data/storage.js?v=5a17bb47";
import { renderTable } from "./data/tracker.js?v=c4f46394";

await initializeStorage();
renderTable(scenarios, heroes);
