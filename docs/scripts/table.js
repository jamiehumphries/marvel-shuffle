import { heroes, scenarios } from "./data/cards.js?v=86b90682";
import { initializeStorage } from "./data/storage.js?v=5a17bb47";
import { renderTable } from "./data/tracker.js?v=45b34849";

await initializeStorage();
renderTable(scenarios, heroes);
