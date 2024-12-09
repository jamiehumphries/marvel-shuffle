import { initializeStorage } from "./storage.js?v=2.4.9";
import { scenarios, heroes } from "./cards.js?v=2.4.9";
import { renderTable } from "./tracker.js?v=2.4.9";

await initializeStorage();
renderTable(scenarios, heroes);
