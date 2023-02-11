import { CardSet, Scenario, Module, Hero, Aspect } from "./options.js";

const set = (name, ...cards) => new CardSet(name, cards);
const coreSet = set.bind(null, "Core Set");
const theGreenGoblin = set.bind(null, "The Green Goblin");
const theWreckingCrew = set.bind(null, "The Wrecking Crew");
const theRiseOfRedSkull = set.bind(null, "The Rise of Red Skull");
const theOnceAndFutureKang = set.bind(null, "The Once and Future Kang");
const theGalaxysMostWanted = set.bind(null, "The Galaxy’s Most Wanted");
const theMadTitansShadow = set.bind(null, "The Mad Titan’s Shadow");
const theHood = set.bind(null, "The Hood");
const sinisterMotives = set.bind(null, "Sinister Motives");
const mutantGenesis = set.bind(null, "Mutant Genesis");
const mojoMania = set.bind(null, "MojoMania");
const printAndPlay = set.bind(null, "Print-and-Play");

// prettier-ignore
const scenarios = [
  coreSet(
    new Scenario("Rhino"),
    new Scenario("Klaw"),
    new Scenario("Ultron")
  ),
  theGreenGoblin(
    new Scenario("Risky Business", true),
    new Scenario("Mutagen Formula")
  ),
  theWreckingCrew(
    new Scenario("Wrecking Crew")
  ),
  theRiseOfRedSkull(
    new Scenario("Crossbones"),
    new Scenario("Absorbing Man"),
    new Scenario("Taskmaster"),
    new Scenario("Zola"),
    new Scenario("Red Skull")
  ),
  theOnceAndFutureKang(
    new Scenario("Kang")
  ),
  theGalaxysMostWanted(
    new Scenario("Brotherhood of Badoon"),
    new Scenario("Infiltrate the Museum"),
    new Scenario("Escape the Museum", true),
    new Scenario("Nebula"),
    new Scenario("Ronan the Accuser")
  ),
  theMadTitansShadow(
    new Scenario("Ebony Maw"),
    new Scenario("Tower Defense", true),
    new Scenario("Thanos"),
    new Scenario("Hela", true),
    new Scenario("Loki")
  ),
  theHood(
    new Scenario("The Hood")
  ),
  sinisterMotives(
    new Scenario("Sandman"),
    new Scenario("Venom"),
    new Scenario("Mysterio"),
    new Scenario("The Sinister Six"),
    new Scenario("Venom Goblin")
  ),
  mutantGenesis(
    new Scenario("Sabretooth"),
    new Scenario("Project Wideawake"),
    new Scenario("Master Mold"),
    new Scenario("Mansion Attack", true),
    new Scenario("Magneto")
  ),
  mojoMania(
    new Scenario("Magog", true),
    new Scenario("Spiral", true),
    new Scenario("Mojo")
  ),
];

// prettier-ignore
const modules = [
  coreSet(
    new Module("Bomb Scare", true),
    new Module("Masters of Evil", true),
    new Module("Under Attack", true),
    new Module("Legions of Hydra", true),
    new Module("The Doomsday Chair", true)
  ),
  theGreenGoblin(
    new Module("Goblin Gimmicks", false),
    new Module("A Mess of Things", true),
    new Module("Power Drain", true),
    new Module("Running Interference", true)
  ),
  theRiseOfRedSkull(
    new Module("Experimental Weapons", false),
    new Module("Hydra Assault", false),
    new Module("Weapon Master", false),
    new Module("Hydra Patrol", true)
  ),
  theOnceAndFutureKang(
    new Module("Temporal", true),
    new Module("Anachronauts", true),
    new Module("Master of Time", false)
  ),
  theGalaxysMostWanted(
    new Module("Band of Badoon", false),
    new Module("Galactic Artifacts", false),
    new Module("Kree Militants", false),
    new Module("Menagerie Medley", false),
    new Module("Space Pirates", false),
    new Module("Ship Command", false)
  ),
  theMadTitansShadow(
    new Module("Black Order", true),
    new Module("Armies of Titan", false),
    new Module("Children of Thanos", false),
    new Module("Infinity Gauntlet", false),
    new Module("Legions of Hel", true),
    new Module("Frost Giants", false),
    new Module("Enchantress", false)
  ),
  theHood(
    new Module("Beasty Boys", true),
    new Module("Brothers Grimm", false),
    new Module("Crossfire’s Crew", false),
    new Module("Mister Hyde", false),
    new Module("Ransacked Armory", false),
    new Module("Sinister Syndicate", false),
    new Module("State of Emergency", false),
    new Module("Streets of Mayhem", false),
    new Module("Wrecking Crew", false)
  ),
  sinisterMotives(
    new Module("City in Chaos", true),
    new Module("Down to Earth", false),
    new Module("Goblin Gear", false),
    new Module("Guerilla Tactics", false),
    new Module("Osborn Tech", false),
    new Module("Personal Nightmare", false),
    new Module("Sinister Assault", false),
    new Module("Symbiotic Strength", false),
    new Module("Whispers of Paranoia", false)
  ),
  mutantGenesis(
    new Module("Brotherhood", true),
    new Module("Mystique", false),
    new Module("Zero Tolerance", true),
    new Module("Sentinels", false),
    new Module("Acolytes", true),
    new Module("Future Past", true)
  ),
  mojoMania(
    new Module("Crime", false),
    new Module("Fantasy", false),
    new Module("Horror", false),
    new Module("Sci-Fi", false),
    new Module("Sitcom", false),
    new Module("Western", false)
  ),
  printAndPlay(
    new Module("Kree Fanatic", false)
  ),
];

// prettier-ignore
const heroes = [
  coreSet(
    new Hero("Black Panther"),
    new Hero("Captain Marvel"),
    new Hero("Iron Man"),
    new Hero("She-Hulk"),
    new Hero("Spider-Man", "Peter Parker")
  ),
  new Hero("Captain America"),
  new Hero("Ms. Marvel"),
  new Hero("Thor"),
  new Hero("Black Widow"),
  new Hero("Doctor Strange"),
  new Hero("Hulk"),
  theRiseOfRedSkull(
    new Hero("Hawkeye"),
    new Hero("Spider-Woman")
  ),
  new Hero("Ant-Man"),
  new Hero("Wasp"),
  new Hero("Quicksilver"),
  new Hero("Scarlet Witch"),
  theGalaxysMostWanted(
    new Hero("Groot"),
    new Hero("Rocket Raccoon")
  ),
  new Hero("Star-Lord"),
  new Hero("Gamora"),
  new Hero("Drax"),
  new Hero("Venom"),
  theMadTitansShadow(
    new Hero("Spectrum"),
    new Hero("Adam Warlock")
  ),
  new Hero("Nebula"),
  new Hero("War Machine"),
  new Hero("Valkyrie"),
  new Hero("Vision"),
  sinisterMotives(
    new Hero("Ghost-Spider"),
    new Hero("Spider-Man", "Miles Morales")
  ),
  new Hero("Nova"),
  new Hero("Ironheart"),
  new Hero("Spider-Ham"),
  new Hero("SP//dr"),
  mutantGenesis(
    new Hero("Colossus"),
    new Hero("Shadowcat")
  ),
  new Hero("Cyclops"),
  new Hero("Phoenix"),
  new Hero("Wolverine"),
  new Hero("Storm"),
  new Hero("Gambit"),
  new Hero("Rogue"),
];

// prettier-ignore
const aspects = [
  coreSet(
    new Aspect("Aggression"),
    new Aspect("Justice"),
    new Aspect("Leadership"),
    new Aspect("Protection"),
  ),
];

export { scenarios, modules, heroes, aspects };
