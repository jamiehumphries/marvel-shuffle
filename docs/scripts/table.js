import { initializeStorage } from "./storage.js?v=00ea94bd";
import { scenarios, heroes } from "./cards.js?v=79e4887a";
import { renderTable } from "./tracker.js?v=b4eec280";

await initializeStorage();
renderTable(scenarios, heroes);
