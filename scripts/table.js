import { initializeStorage } from "./storage.js?v=2.4.5";
import { scenarios, heroes } from "./cards.js?v=2.4.5";
import { renderTable } from "./tracker.js?v=2.4.5";

await initializeStorage();
renderTable(scenarios, heroes);
