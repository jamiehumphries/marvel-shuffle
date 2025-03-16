import {
  ADD_ALTER_EGO,
  MIGRATE_DIFFICULTY,
  REMOVE,
  RENAME,
} from "./operations.js?v=e052d1d0";

export const migration0001 = [
  [ADD_ALTER_EGO, "captain-marvel", "carol-danvers"],
  [ADD_ALTER_EGO, "she-hulk", "jennifer-walters"],
  [ADD_ALTER_EGO, "iron-man", "tony-stark"],
  [ADD_ALTER_EGO, "black-panther", "tchalla"],
  [ADD_ALTER_EGO, "captain-america", "steve-rogers"],
  [ADD_ALTER_EGO, "ms-marvel", "kamala-khan"],
  [ADD_ALTER_EGO, "thor", "odinson"],
  [ADD_ALTER_EGO, "black-widow", "natasha-romanoff"],
  [ADD_ALTER_EGO, "doctor-strange", "stephen-strange"],
  [ADD_ALTER_EGO, "hulk", "bruce-banner"],
  [ADD_ALTER_EGO, "hawkeye", "clint-barton"],
  [ADD_ALTER_EGO, "spider-woman", "jessica-drew"],
  [ADD_ALTER_EGO, "ant-man", "scott-lang"],
  [ADD_ALTER_EGO, "wasp", "nadia-van-dyne"],
  [ADD_ALTER_EGO, "quicksilver", "pietro-maximoff"],
  [ADD_ALTER_EGO, "scarlet-witch", "wanda-maximoff"],
  [ADD_ALTER_EGO, "star-lord", "peter-quill"],
  [ADD_ALTER_EGO, "venom", "flash-thompson"],
  [ADD_ALTER_EGO, "spectrum", "monica-rambeau"],
  [ADD_ALTER_EGO, "war-machine", "james-rhodes"],
  [ADD_ALTER_EGO, "valkyrie", "brunnhilde"],
  [ADD_ALTER_EGO, "ghost-spider", "gwen-stacy"],
  [ADD_ALTER_EGO, "nova", "sam-alexander"],
  [ADD_ALTER_EGO, "ironheart", "riri-williams"],
  [ADD_ALTER_EGO, "spider-ham", "peter-porker"],
  [ADD_ALTER_EGO, "sp-dr", "peni-parker"],
  [ADD_ALTER_EGO, "colossus", "piotr-rasputin"],
  [ADD_ALTER_EGO, "shadowcat", "kitty-pryde"],
  [ADD_ALTER_EGO, "cyclops", "scott-summers"],
  [ADD_ALTER_EGO, "phoenix", "jean-grey"],
  [ADD_ALTER_EGO, "wolverine", "logan"],
  [ADD_ALTER_EGO, "storm", "ororo-munroe"],
  [ADD_ALTER_EGO, "gambit", "remy-lebeau"],
  [ADD_ALTER_EGO, "rogue", "anna-marie"],
  [ADD_ALTER_EGO, "cable", "nathan-summers"],
  [ADD_ALTER_EGO, "domino", "neena-thurman"],
  [ADD_ALTER_EGO, "psylocke", "betsy-braddock"],
  [ADD_ALTER_EGO, "angel", "warren-worthington-iii"],
  [ADD_ALTER_EGO, "x-23", "laura-kinney"],
  [ADD_ALTER_EGO, "deadpool", "wade-wilson"],
  [ADD_ALTER_EGO, "bishop", "lucas-bishop"],
  [ADD_ALTER_EGO, "magik", "illyana-rasputin"],
  [ADD_ALTER_EGO, "iceman", "bobby-drake"],
  [ADD_ALTER_EGO, "jubilee", "jubilation-lee"],
  [ADD_ALTER_EGO, "nightcrawler", "kurt-wagner"],
  [ADD_ALTER_EGO, "magneto", "erik-lehnsherr"],
  [RENAME, "forced", "setting--forced"],
  [RENAME, "module", "modular"],
  [REMOVE, "modular--prelates"],
  [REMOVE, "modular--hope-summers"],
  [MIGRATE_DIFFICULTY, "standard"],
  [MIGRATE_DIFFICULTY, "standard-ii"],
  [MIGRATE_DIFFICULTY, "standard-iii"],
  [MIGRATE_DIFFICULTY, "expert"],
  [MIGRATE_DIFFICULTY, "expert-ii"],
];
