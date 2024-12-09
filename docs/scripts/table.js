import { initializeStorage } from "./storage.js?v=00ea94bd";
import { scenarios, heroes } from "./cards.js?v=b4948432";
import { renderTable } from "./tracker.js?v=313bc14f";

await initializeStorage();
renderTable(scenarios, heroes);
