import { initializeStorage } from "./storage.js?v=2.4.7";
import { scenarios, heroes } from "./cards.js?v=2.4.7";
import { renderTable } from "./tracker.js?v=2.4.7";

await initializeStorage();
renderTable(scenarios, heroes);
