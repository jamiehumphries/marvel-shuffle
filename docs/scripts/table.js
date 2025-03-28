import { heroes, scenarios } from "./data/cards.js?v=99e2ed8e";
import { initializeStorage } from "./data/storage.js?v=b7e72aeb";
import { renderTable } from "./data/tracker.js?v=568d61c2";

await initializeStorage();
renderTable(scenarios, heroes);
