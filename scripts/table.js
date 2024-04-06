import { initializeStorage } from "./storage.js?v=2.4.4";
import { scenarios, heroes } from "./cards.js?v=2.4.4";
import { renderTable } from "./tracker.js?v=2.4.4";

await initializeStorage();
renderTable(scenarios, heroes);
