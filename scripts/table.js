import { initializeStorage } from "./storage.js?v=2.3.2";
import { scenarios, heroes } from "./cards.js?v=2.3.2";
import { renderTable } from "./tracker.js?v=2.3.2";

await initializeStorage();
renderTable(scenarios, heroes);
