import { initializeStorage } from "./storage.js?v=tracker";
import { scenarios, heroes } from "./cards.js?v=tracker";
import { renderTable } from "./tracker.js?v=tracker";

await initializeStorage();
renderTable(scenarios, heroes);
