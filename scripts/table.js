import { initializeStorage } from "./storage.js?v=2.4.6";
import { scenarios, heroes } from "./cards.js?v=2.4.6";
import { renderTable } from "./tracker.js?v=2.4.6";

await initializeStorage();
renderTable(scenarios, heroes);
