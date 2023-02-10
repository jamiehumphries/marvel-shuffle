import { CardSet, Scenario, Module, Hero, Aspect } from "./options.js";

const scenarios = [
  new CardSet("Core Set", [
    new Scenario("Rhino"),
    new Scenario("Klaw"),
    new Scenario("Ultron"),
  ]),
  new CardSet("The Green Goblin", [
    new Scenario("Risky Business", true),
    new Scenario("Mutagen Formula"),
  ]),
  new Scenario("The Wrecking Crew"),
  new CardSet("The Rise of Red Skull", [
    new Scenario("Crossbones"),
    new Scenario("Absorbing Man"),
    new Scenario("Taskmaster"),
    new Scenario("Zola"),
    new Scenario("Red Skull"),
  ]),
];

const modules = [
  new CardSet("Core Set", [
    new Module("Bomb Scare"),
    new Module("The Masters of Evil"),
    new Module("Under Attack"),
    new Module("Legions of Hydra"),
    new Module("The Doomsday Chair"),
  ]),
  new CardSet("The Green Goblin", [
    new Module("Goblin Gimmicks", false),
    new Module("A Mess of Things"),
    new Module("Power Drain"),
    new Module("Running Interference"),
  ]),
  new CardSet("The Rise of Red Skull", [
    new Module("Experimental Weapons", false),
    new Module("Hydra Assault", false),
    new Module("Weapon Master", false),
    new Module("Hydra Patrol"),
  ]),
  new CardSet("The Once and Future Kang", [new Module("Anachronauts")]),
];

const heroes = [
  new CardSet("Core Set", [
    new Hero("Black Panther"),
    new Hero("Captain Marvel"),
    new Hero("Iron Man"),
    new Hero("She-Hulk"),
    new Hero("Spider-Man"),
  ]),
  new Hero("Captain America"),
  new Hero("Ms. Marvel"),
  new Hero("Thor"),
  new Hero("Black Widow"),
  new Hero("Doctor Strange"),
  new Hero("Hulk"),
  new CardSet("The Rise of Red Skull", [
    new Hero("Hawkeye"),
    new Hero("Spider-Woman"),
  ]),
];

const aspects = [
  new CardSet("Core Set", [
    new Aspect("Aggression"),
    new Aspect("Justice"),
    new Aspect("Leadership"),
    new Aspect("Protection"),
  ]),
];

export { scenarios, modules, heroes, aspects };
