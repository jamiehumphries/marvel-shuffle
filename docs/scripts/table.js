import { heroes, scenarios } from "./cards.js?v=4416f240";
import { initializeStorage } from "./storage.js?v=b419bdb4";
import { renderTable } from "./tracker.js?v=bcc2ce19";

await initializeStorage();
renderTable(scenarios, heroes);
