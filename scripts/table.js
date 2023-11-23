import { initializeStorage } from "./storage.js?v=2.4.1";
import { scenarios, heroes } from "./cards.js?v=2.4.1";
import { renderTable } from "./tracker.js?v=2.4.1";

await initializeStorage();
renderTable(scenarios, heroes);
