import { initializeStorage } from "./storage.js?v=2.4.8";
import { scenarios, heroes } from "./cards.js?v=2.4.8";
import { renderTable } from "./tracker.js?v=2.4.8";

await initializeStorage();
renderTable(scenarios, heroes);
