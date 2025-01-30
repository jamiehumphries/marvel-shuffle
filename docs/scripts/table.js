import { initializeStorage } from "./storage.js?v=00ea94bd";
import { scenarios, heroes } from "./cards.js?v=17ba0c0b";
import { renderTable } from "./tracker.js?v=549ed139";

await initializeStorage();
renderTable(scenarios, heroes);
