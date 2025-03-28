import { remove, rename, setDefault } from "./operations.js?v=e052d1d0";

const alterEgos = [
  ["captain-marvel", "carol-danvers"],
  ["she-hulk", "jennifer-walters"],
  ["iron-man", "tony-stark"],
  ["black-panther", "tchalla"],
  ["captain-america", "steve-rogers"],
  ["ms-marvel", "kamala-khan"],
  ["thor", "odinson"],
  ["black-widow", "natasha-romanoff"],
  ["doctor-strange", "stephen-strange"],
  ["hulk", "bruce-banner"],
  ["hawkeye", "clint-barton"],
  ["spider-woman", "jessica-drew"],
  ["ant-man", "scott-lang"],
  ["wasp", "nadia-van-dyne"],
  ["quicksilver", "pietro-maximoff"],
  ["scarlet-witch", "wanda-maximoff"],
  ["star-lord", "peter-quill"],
  ["venom", "flash-thompson"],
  ["spectrum", "monica-rambeau"],
  ["war-machine", "james-rhodes"],
  ["valkyrie", "brunnhilde"],
  ["ghost-spider", "gwen-stacy"],
  ["nova", "sam-alexander"],
  ["ironheart", "riri-williams"],
  ["spider-ham", "peter-porker"],
  ["sp-dr", "peni-parker"],
  ["colossus", "piotr-rasputin"],
  ["shadowcat", "kitty-pryde"],
  ["cyclops", "scott-summers"],
  ["phoenix", "jean-grey"],
  ["wolverine", "logan"],
  ["storm", "ororo-munroe"],
  ["gambit", "remy-lebeau"],
  ["rogue", "anna-marie"],
  ["cable", "nathan-summers"],
  ["domino", "neena-thurman"],
  ["psylocke", "betsy-braddock"],
  ["angel", "warren-worthington-iii"],
  ["x-23", "laura-kinney"],
  ["deadpool", "wade-wilson"],
  ["bishop", "lucas-bishop"],
  ["magik", "illyana-rasputin"],
  ["iceman", "bobby-drake"],
  ["jubilee", "jubilation-lee"],
  ["nightcrawler", "kurt-wagner"],
  ["magneto", "erik-lehnsherr"],
];

const difficulties = [
  "standard",
  "standard-ii",
  "standard-iii",
  "expert",
  "expert-ii",
];

export const migration0001 = [
  ...alterEgos.map(addAlterEgo),
  setDefault("setting--track-difficulty-standard", true),
  ...difficulties.flatMap(migrateDifficulty),
  remove("module--prelates"),
  remove("module--hope-summers"),
  rename("module", "modular"),
  rename("forced", "setting--forced"),
];

function addAlterEgo([hero, alterEgo]) {
  return rename(hero, `${hero}-${alterEgo}`);
}

function migrateDifficulty(difficulty) {
  return [
    rename(`setting--track-difficulty-${difficulty}`, difficulty),
    rename(difficulty, `difficulty--${difficulty}`),
  ];
}
