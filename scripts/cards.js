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

// Modules required by a scenario.
const experimentalWeapons = new Module("Experimental Weapons");
const hydraPatrol = new Module("Hydra Patrol", { isLandscape: true });
const galacticArtifacts = new Module("Galactic Artifacts");
const shipCommand = new Module("Ship Command");
const infinityGauntlet = new Module("Infinity Gauntlet");
const cityInChaos = new Module("City in Chaos", { isLandscape: true });
const guerillaTactics = new Module("Guerilla Tactics");
const personalNightmare = new Module("Personal Nightmare");
const symbioticStrength = new Module("Symbiotic Strength");
const brotherhood = new Module("Brotherhood", { isLandscape: true });
const zeroTolerance = new Module("Zero Tolerance", { isLandscape: true });
const sentinels = new Module("Sentinels");
const mojoManiaModules = [
  new Module("Crime"),
  new Module("Fantasy"),
  new Module("Horror"),
  new Module("Sci-Fi"),
  new Module("Sitcom"),
  new Module("Western"),
];

// prettier-ignore
const modules = [
  coreSet(
    new Module("Bomb Scare", { isLandscape: true }),
    new Module("Masters of Evil", { isLandscape: true }),
    new Module("Under Attack", { isLandscape: true }),
    new Module("Legions of Hydra", { isLandscape: true }),
    new Module("The Doomsday Chair", { isLandscape: true })
  ),
  theGreenGoblin(
    new Module("Goblin Gimmicks"),
    new Module("A Mess of Things", { isLandscape: true }),
    new Module("Power Drain", { isLandscape: true }),
    new Module("Running Interference", { isLandscape: true })
  ),
  theRiseOfRedSkull(
    experimentalWeapons,
    new Module("Hydra Assault"),
    new Module("Weapon Master"),
    hydraPatrol
  ),
  theOnceAndFutureKang(
    new Module("Temporal", { isLandscape: true }),
    new Module("Anachronauts", { isLandscape: true }),
    new Module("Master of Time")
  ),
  theGalaxysMostWanted(
    new Module("Band of Badoon"),
    galacticArtifacts,
    new Module("Kree Militants"),
    new Module("Menagerie Medley"),
    new Module("Space Pirates"),
    shipCommand
  ),
  theMadTitansShadow(
    new Module("Black Order", { isLandscape: true }),
    new Module("Armies of Titan"),
    new Module("Children of Thanos"),
    infinityGauntlet,
    new Module("Legions of Hel", { isLandscape: true }),
    new Module("Frost Giants"),
    new Module("Enchantress")
  ),
  theHood(
    new Module("Beasty Boys", { isLandscape: true }),
    new Module("Brothers Grimm"),
    new Module("Crossfire’s Crew"),
    new Module("Mister Hyde"),
    new Module("Ransacked Armory"),
    new Module("Sinister Syndicate"),
    new Module("State of Emergency"),
    new Module("Streets of Mayhem"),
    new Module("Wrecking Crew")
  ),
  sinisterMotives(
    cityInChaos,
    new Module("Down to Earth"),
    new Module("Goblin Gear"),
    guerillaTactics,
    new Module("Osborn Tech"),
    personalNightmare,
    new Module("Sinister Assault"),
    symbioticStrength,
    new Module("Whispers of Paranoia")
  ),
  mutantGenesis(
    brotherhood,
    new Module("Mystique"),
    zeroTolerance,
    sentinels,
    new Module("Acolytes", { isLandscape: true }),
    new Module("Future Past", { isLandscape: true })
  ),
  mojoMania(...mojoManiaModules),
  printAndPlay(
    new Module("Kree Fanatic")
  ),
];

const allModules = modules.flatMap(
  (cardOrSet) => cardOrSet.children || [cardOrSet]
);

const allModulesExceptMojoMania = allModules.filter(
  (module) => !mojoManiaModules.includes(module)
);

// prettier-ignore
const scenarios = [
  coreSet(
    new Scenario("Rhino", 1),
    new Scenario("Klaw", 1),
    new Scenario("Ultron", 1)
  ),
  theGreenGoblin(
    new Scenario("Risky Business", 1,  { hasBack: true }),
    new Scenario("Mutagen Formula", 1)
  ),
  theWreckingCrew(
    new Scenario("Wrecking Crew", 0)
  ),
  theRiseOfRedSkull(
    new Scenario("Crossbones", 3, { exclude: [experimentalWeapons] }),
    new Scenario("Absorbing Man", 1),
    new Scenario("Taskmaster", 1, { exclude: [hydraPatrol] }),
    new Scenario("Zola", 1),
    new Scenario("Red Skull", 2)
  ),
  theOnceAndFutureKang(
    new Scenario("Kang", 1)
  ),
  theGalaxysMostWanted(
    new Scenario("Brotherhood of Badoon", 1, { exclude: [shipCommand] }),
    new Scenario("Infiltrate the Museum", 1, { exclude: [galacticArtifacts] }),
    new Scenario("Escape the Museum", 1, { exclude: [galacticArtifacts, shipCommand], hasBack: true }),
    new Scenario("Nebula", 1, { exclude: [shipCommand] }),
    new Scenario("Ronan the Accuser", 1, { exclude: [shipCommand] })
  ),
  theMadTitansShadow(
    new Scenario("Ebony Maw", 2),
    new Scenario("Tower Defense", 1, { hasBack: true }),
    new Scenario("Thanos", 2, { exclude: [infinityGauntlet] }),
    new Scenario("Hela", 2, { hasBack: true }),
    new Scenario("Loki", 2, { exclude: [infinityGauntlet] })
  ),
  theHood(
    new Scenario("The Hood", 7)
  ),
  sinisterMotives(
    new Scenario("Sandman", 1, { exclude: [cityInChaos] }),
    new Scenario("Venom", 1, { exclude: [symbioticStrength] }),
    new Scenario("Mysterio", 1, { exclude: [personalNightmare] }),
    new Scenario("The Sinister Six", 0, { exclude: [guerillaTactics] }),
    new Scenario("Venom Goblin", 1, { exclude: [symbioticStrength] })
  ),
  mutantGenesis(
    new Scenario("Sabretooth", 2),
    new Scenario("Project Wideawake", 1, { exclude: [zeroTolerance] }),
    new Scenario("Master Mold", 1, { exclude: [sentinels] }),
    new Scenario("Mansion Attack", 1, { exclude: [brotherhood], hasBack: true }),
    new Scenario("Magneto", 1)
  ),
  mojoMania(
    new Scenario("Magog", 1, { hasBack: true }),
    new Scenario("Spiral", 3, { exclude: allModulesExceptMojoMania, hasBack: true }),
    new Scenario("Mojo", 2, { exclude: allModulesExceptMojoMania })
  ),
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

// prettier-ignore
const heroes = [
  coreSet(
    new Hero("Black Panther"),
    new Hero("Captain Marvel"),
    new Hero("Iron Man"),
    new Hero("She-Hulk"),
    new Hero("Spider-Man", { alterEgo: "Peter Parker" })
  ),
  new Hero("Captain America"),
  new Hero("Ms. Marvel"),
  new Hero("Thor"),
  new Hero("Black Widow"),
  new Hero("Doctor Strange"),
  new Hero("Hulk"),
  theRiseOfRedSkull(
    new Hero("Hawkeye"),
    new Hero("Spider-Woman", { aspects: 2 })
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
    new Hero("Adam Warlock", { aspects: 4 })
  ),
  new Hero("Nebula"),
  new Hero("War Machine"),
  new Hero("Valkyrie"),
  new Hero("Vision"),
  sinisterMotives(
    new Hero("Ghost-Spider"),
    new Hero("Spider-Man", { alterEgo: "Miles Morales" })
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

export { scenarios, modules, heroes, aspects };
