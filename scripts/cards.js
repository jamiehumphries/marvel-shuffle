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
    new Scenario("The Tower Defense"),
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
    new Scenario("Mansion Attack"),
    new Scenario("Magneto")
  ),
  mojoMania(
    new Scenario("Magog"),
    new Scenario("Spiral"),
    new Scenario("Mojo")
  ),
];

// prettier-ignore
const modules = [
  coreSet(
    new Module("Bomb Scare"),
    new Module("The Masters of Evil"),
    new Module("Under Attack"),
    new Module("Legions of Hydra"),
    new Module("The Doomsday Chair")
  ),
  theGreenGoblin(
    new Module("Goblin Gimmicks", false),
    new Module("A Mess of Things"),
    new Module("Power Drain"),
    new Module("Running Interference")
  ),
  theRiseOfRedSkull(
    new Module("Experimental Weapons", false),
    new Module("Hydra Assault", false),
    new Module("Weapon Master", false),
    new Module("Hydra Patrol")
  ),
  theOnceAndFutureKang(
    new Module("Temporal"),
    new Module("Anachronauts"),
    new Module("Master of Time")
  ),
  theGalaxysMostWanted(
    new Module("Band of Badoon"),
    new Module("Galactic Artifacts"),
    new Module("Kree Militants"),
    new Module("Menagerie Medley"),
    new Module("Space Pirates"),
    new Module("Ship Command")
  ),
  theMadTitansShadow(
    new Module("Black Order"),
    new Module("Armies of Titan"),
    new Module("Children of Thanos"),
    new Module("Infinity Gauntlet"),
    new Module("Legions of Hel"),
    new Module("Frost Giants"),
    new Module("Enchantress")
  ),
  theHood(
    new Module("Beasty Boys"),
    new Module("Brothers Grimm"),
    new Module("Crossfire’s Crew"),
    new Module("Mimster Hyde"),
    new Module("Ransacked Armory"),
    new Module("Sinister Syndicate"),
    new Module("State of Emergency"),
    new Module("Streets of Mayhem"),
    new Module("Wrecking Crew")
  ),
  sinisterMotives(
    new Module("City in Chaos"),
    new Module("Down to Earth"),
    new Module("Goblin Gear"),
    new Module("Guerilla Tactics"),
    new Module("Osborn Tech"),
    new Module("Personal Nightmare"),
    new Module("Sinister Assault"),
    new Module("Symbiotic Strength"),
    new Module("Whispers of Paranoia")
  ),
  mutantGenesis(
    new Module("Brotherhood"),
    new Module("Mystique"),
    new Module("Zero Tolerance"),
    new Module("Sentinels"),
    new Module("Acolytes"),
    new Module("Future Past")
  ),
  mojoMania(
    new Module("Crime"),
    new Module("Fantasy"),
    new Module("Horror"),
    new Module("Sci-Fi"),
    new Module("Sitcom"),
    new Module("Western")
  ),
  printAndPlay(
    new Module("Kree Fanatic")
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
  new Hero("The Vision"),
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
