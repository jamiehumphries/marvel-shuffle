import { initializeStorage } from "./storage.js?v=2.4.0";
import { scenarios, heroes } from "./cards.js?v=2.4.0";
import { renderTable } from "./tracker.js?v=2.4.0";

await initializeStorage();
renderTable(scenarios, heroes);
