import { initializeStorage } from "./storage.js?v=2.4.3";
import { scenarios, heroes } from "./cards.js?v=2.4.3";
import { renderTable } from "./tracker.js?v=2.4.3";

await initializeStorage();
renderTable(scenarios, heroes);
