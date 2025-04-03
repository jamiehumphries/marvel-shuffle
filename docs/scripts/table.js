import { heroes, scenarios } from "./data/cards.js";
import { initializeStorage } from "./data/storage.js";
import { renderTable } from "./data/tracker.js";

await initializeStorage();
renderTable(scenarios, heroes);
