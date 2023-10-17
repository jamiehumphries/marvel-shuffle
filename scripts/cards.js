import { CardSet, Scenario, Module, Hero, Aspect } from "./options.js?v=2.0.3";

function ensureArray(arrayOrString) {
  return Array.isArray(arrayOrString) ? arrayOrString : [arrayOrString];
}

// SETS

function cardSet(name) {
  return (...cards) => new CardSet(name, cards);
}

const coreSet = cardSet("Core Set");
const theGreenGoblin = cardSet("The Green Goblin");
const theWreckingCrew = cardSet("The Wrecking Crew");
const theRiseOfRedSkull = cardSet("The Rise of Red Skull");
const theOnceAndFutureKang = cardSet("The Once and Future Kang");
const theGalaxysMostWanted = cardSet("The Galaxy’s Most Wanted");
const theMadTitansShadow = cardSet("The Mad Titan’s Shadow");
const theHood = cardSet("The Hood");
const sinisterMotives = cardSet("Sinister Motives");
const nova = cardSet("Nova");
const ironheart = cardSet("Ironheart");
const spiderHam = cardSet("Spider-Ham");
const spdr = cardSet("Sp//dr");
const mutantGenesis = cardSet("Mutant Genesis");
const mojoMania = cardSet("MojoMania");
const wolverine = cardSet("Wolverine");
const storm = cardSet("Storm");
const gambit = cardSet("Gambit");
const rogue = cardSet("Rogue");
const neXtEvolution = cardSet("NeXt Evolution");

const printAndPlay = cardSet("Print-and-Play");

// MODULES

function module(name, options) {
  return new Module(name, options);
}

// prettier-ignore
const modules = [
  coreSet(
    module("Bomb Scare", { isLandscape: true }),
    module("Masters of Evil", { isLandscape: true }),
    module("Under Attack", { isLandscape: true }),
    module("Legions of Hydra", { isLandscape: true }),
    module("The Doomsday Chair", { isLandscape: true })
  ),
  theGreenGoblin(
    module("Goblin Gimmicks"),
    module("A Mess of Things", { isLandscape: true }),
    module("Power Drain", { isLandscape: true }),
    module("Running Interference", { isLandscape: true })
  ),
  theRiseOfRedSkull(
    module("Experimental Weapons"),
    module("Hydra Assault"),
    module("Weapon Master"),
    module("Hydra Patrol", { isLandscape: true })
  ),
  theOnceAndFutureKang(
    module("Temporal", { isLandscape: true }),
    module("Anachronauts", { isLandscape: true }),
    module("Master of Time")
  ),
  theGalaxysMostWanted(
    module("Band of Badoon"),
    module("Galactic Artifacts"),
    module("Kree Militants"),
    module("Menagerie Medley"),
    module("Space Pirates"),
    module("Ship Command"),
    module("Power Stone"),
    module("Badoon Headhunter")
  ),
  theMadTitansShadow(
    module("Black Order", { isLandscape: true }),
    module("Armies of Titan"),
    module("Children of Thanos"),
    module("Infinity Gauntlet"),
    module("Legions of Hel", { isLandscape: true }),
    module("Frost Giants"),
    module("Enchantress")
  ),
  theHood(
    module("Beasty Boys", { isLandscape: true }),
    module("Brothers Grimm"),
    module("Crossfire’s Crew"),
    module("Mister Hyde"),
    module("Ransacked Armory"),
    module("Sinister Syndicate"),
    module("State of Emergency"),
    module("Streets of Mayhem"),
    module("Wrecking Crew")
  ),
  sinisterMotives(
    module("City in Chaos", { isLandscape: true }),
    module("Down to Earth"),
    module("Goblin Gear"),
    module("Guerilla Tactics"),
    module("Osborn Tech"),
    module("Personal Nightmare"),
    module("Sinister Assault"),
    module("Symbiotic Strength"),
    module("Whispers of Paranoia")
  ),
  nova(
    module("Armadillo")
  ),
  ironheart(
    module("Zzzax")
  ),
  spiderHam(
    module("The Inheritors")
  ),
  spdr(
    module("Iron Spider’s Sinister Six")
  ),
  mutantGenesis(
    module("Brotherhood", { isLandscape: true }),
    module("Mystique"),
    module("Zero Tolerance", { isLandscape: true }),
    module("Sentinels"),
    module("Acolytes", { isLandscape: true }),
    module("Future Past", { isLandscape: true })
  ),
  mojoMania(
    module("Crime"),
    module("Fantasy"),
    module("Horror"),
    module("Sci-Fi"),
    module("Sitcom"),
    module("Western")
  ),
  wolverine(
    module("Deathstrike")
  ),
  storm(
    module("Shadow King")
  ),
  gambit(
    module("Exodus")
  ),
  rogue(
    module("Reavers", { isLandscape: true })
  ),
  neXtEvolution(
    module("Hope Summers", { hasBack: true }),
    module("Flight"),
    module("Super Strength"),
    module("Telepathy"),
    module("Military Grade"),
    module("Mutant Slayers", { isLandscape: true }),
    module("Nasty Boys", { isLandscape: true }),
    module("Black Tom Cassidy"),
    module("Extreme Measures", { isLandscape: true }),
    module("Mutant Insurrection", { isLandscape: true })
  ),
  printAndPlay(
    module("Kree Fanatic")
  ),
];

// SCENARIOS

const allModules = modules.flatMap(
  (cardOrSet) => cardOrSet.children || [cardOrSet],
);

const nonMojoManiaModules = modules.flatMap((cardOrSet) => {
  if (cardOrSet.name === "MojoMania") {
    return [];
  }
  return cardOrSet.children?.map((card) => card.name) || [cardOrSet.name];
});

function findModules(names) {
  return ensureArray(names).map((name) => findModule(name));
}

function findModule(name) {
  const module = allModules.find((module) => module.name === name);
  if (!module) {
    throw new Error(`Could not find moduled named "${name}".`);
  }
  return module;
}

function scenario(name, moduleNamesOrNumber, color, options = {}) {
  options.exclude &&= findModules(options.exclude);
  const modulesOrNumber =
    typeof moduleNamesOrNumber === "number"
      ? moduleNamesOrNumber
      : findModules(moduleNamesOrNumber);
  return new Scenario(name, modulesOrNumber, color, options);
}

// prettier-ignore
const scenarios = [
  coreSet(
    scenario("Rhino", "Bomb Scare", "#d0cece"),
    scenario("Klaw", "Masters of Evil", "#7030a0"),
    scenario("Ultron", "Under Attack", "#ed7d31")
  ),
  theGreenGoblin(
    scenario("Risky Business", "Goblin Gimmicks", "#00b050",  { hasBack: true }),
    scenario("Mutagen Formula", "Goblin Gimmicks", "#660066")
  ),
  theWreckingCrew(
    scenario("Wrecking Crew", 0, "#ffc000")
  ),
  theRiseOfRedSkull(
    scenario("Crossbones", ["Hydra Assault", "Weapon Master", "Legions of Hydra"], "#404040", { exclude: "Experimental Weapons" }),
    scenario("Absorbing Man", "Hydra Patrol", "#7030a0"),
    scenario("Taskmaster", "Weapon Master", "#c9c9c9", { exclude: "Hydra Patrol" }),
    scenario("Zola", "Under Attack", "#adc1e5"),
    scenario("Red Skull", ["Hydra Assault", "Hydra Patrol"], "#ff0000")
  ),
  theOnceAndFutureKang(
    scenario("Kang", "Temporal", "#00b050")
  ),
  theGalaxysMostWanted(
    scenario("Brotherhood of Badoon", "Band of Badoon", "#660066", { exclude: "Ship Command" }),
    scenario("Infiltrate the Museum", "Menagerie Medley", "#c00000", { exclude: "Galactic Artifacts" }),
    scenario("Escape the Museum", "Menagerie Medley", "#afdc7e", { exclude: ["Galactic Artifacts", "Ship Command"], hasBack: true }),
    scenario("Nebula", "Space Pirates", "#a9cbe9", { exclude: "Ship Command" }),
    scenario("Ronan the Accuser", "Kree Militants", "#305496", { exclude: "Ship Command" })
  ),
  theMadTitansShadow(
    scenario("Ebony Maw", ["Armies of Titan", "Black Order"], "#404040"),
    scenario("Tower Defense", "Armies of Titan", "#c7d0db", { hasBack: true }),
    scenario("Thanos", ["Black Order", "Children of Thanos"], "#9900ff", { exclude: "Infinity Gauntlet" }),
    scenario("Hela", ["Legions of Hel", "Frost Giants"], "#B4D79D", { hasBack: true }),
    scenario("Loki", ["Enchantress", "Frost Giants"], "#ffc000", { exclude: "Infinity Gauntlet" })
  ),
  theHood(
    scenario("The Hood", 7, "#c00000")
  ),
  sinisterMotives(
    scenario("Sandman", "Down to Earth", "#ffcc66", { exclude: "City in Chaos" }),
    scenario("Venom", "Down to Earth", "#404040", { exclude: "Symbiotic Strength" }),
    scenario("Mysterio", "Whispers of Paranoia", "#7030a0", { exclude: "Personal Nightmare" }),
    scenario("The Sinister Six", 0, "#F4AD7C", { exclude: "Guerilla Tactics" }),
    scenario("Venom Goblin", "Goblin Gear", "#375623", { exclude: "Symbiotic Strength" })
  ),
  mutantGenesis(
    scenario("Sabretooth", ["Brotherhood", "Mystique"], "#ffc000"),
    scenario("Project Wideawake", "Sentinels", "#9933ff", { exclude: "Zero Tolerance" }),
    scenario("Master Mold", "Zero Tolerance", "#7030a0", { exclude: "Sentinels" }),
    scenario("Mansion Attack", "Mystique", "#d0cece", { exclude: "Brotherhood", hasBack: true }),
    scenario("Magneto", "Acolytes", "#c00000")
  ),
  mojoMania(
    scenario("Magog", 1, "#e66914", { hasBack: true }),
    scenario("Spiral", 3, "#acccea", { exclude: nonMojoManiaModules, hasBack: true }),
    scenario("Mojo", 1, "#ffcc00", { exclude: nonMojoManiaModules, additionalModulesPerHero: 1 })
  ),
  neXtEvolution(
    scenario("Morlock Siege", ["Military Grade", "Mutant Slayers"], "#00b050", { hasBack: true }),
    scenario("On the Run", ["Military Grade", "Nasty Boys"], "#7030a0", { exclude: "Mutant Slayers", hasBack: true }),
    scenario("Juggernaut", "Black Tom Cassidy", "#c00000", { exclude: "Hope Summers" }),
    scenario("Mister Sinister", "Nasty Boys", "#305496", { exclude: ["Flight", "Super Strength", "Telepathy", "Hope Summers"] }),
    scenario("Stryfe", ["Extreme Measures", "Mutant Insurrection"], "#ff0000", { exclude: "Hope Summers" })
  ),
];

// ASPECTS

function aspect(name) {
  return new Aspect(name);
}

const AGGRESSION = aspect("Aggression");
const JUSTICE = aspect("Justice");
const LEADERSHIP = aspect("Leadership");
const PROTECTION = aspect("Protection");
const POOL = aspect("‘Pool");

// prettier-ignore
const aspects = [
  coreSet(
    AGGRESSION,
    JUSTICE,
    LEADERSHIP,
    PROTECTION
  ),
  POOL,
];

// HEROES

function hero(name, aspects, color, options) {
  aspects = ensureArray(aspects);
  return new Hero(name, aspects, color, options);
}

// prettier-ignore
const heroes = [
  coreSet(
    hero("Spider-Man", JUSTICE, "#ff0000", { alterEgo: "Peter Parker" }),
    hero("Captain Marvel", LEADERSHIP, "#0070c0"),
    hero("She-Hulk", AGGRESSION, "#00b050"),
    hero("Iron Man", AGGRESSION, "#ffc000"),
    hero("Black Panther", PROTECTION, "#404040")
  ),
  hero("Captain America", LEADERSHIP, "#0070c0"),
  hero("Ms. Marvel", PROTECTION, "#ff0000"),
  hero("Thor", AGGRESSION, "#ffc000"),
  hero("Black Widow", JUSTICE, "#404040"),
  hero("Doctor Strange", PROTECTION, "#c00000"),
  hero("Hulk", AGGRESSION, "#00b050"),
  theRiseOfRedSkull(
    hero("Hawkeye", LEADERSHIP, "#7030a0"),
    hero("Spider-Woman", [AGGRESSION, JUSTICE], "#ffc000")
  ),
  hero("Ant-Man", LEADERSHIP, "#c00000", { hasGiantForm: true }),
  hero("Wasp", AGGRESSION, "#404040", { hasGiantForm: true }),
  hero("Quicksilver", PROTECTION, "#81deff"),
  hero("Scarlet Witch", JUSTICE, "#ff0000"),
  theGalaxysMostWanted(
    hero("Groot", PROTECTION, "#996633"),
    hero("Rocket Raccoon", AGGRESSION, "#c00000")
  ),
  hero("Star-Lord", LEADERSHIP, "#c4cdda"),
  hero("Gamora", AGGRESSION, "#00b050"),
  hero("Drax", PROTECTION, "#afdc7e"),
  hero("Venom", JUSTICE, "#404040"),
  theMadTitansShadow(
    hero("Spectrum", LEADERSHIP, "#f2f2f2"),
    hero("Adam Warlock", [AGGRESSION, JUSTICE, LEADERSHIP, PROTECTION], "#c00000")
  ),
  hero("Nebula", JUSTICE, "#a9cbe9"),
  hero("War Machine", LEADERSHIP, "#808080"),
  hero("Valkyrie", AGGRESSION, "#404040"),
  hero("Vision", PROTECTION, "#ff3300"),
  sinisterMotives(
    hero("Ghost-Spider", PROTECTION, "#f2f2f2"),
    hero("Spider-Man", JUSTICE, "#404040", { alterEgo: "Miles Morales" })
  ),
  hero("Nova", AGGRESSION, "#ffc000"),
  hero("Ironheart", LEADERSHIP, "#b4c6e7"),
  hero("Spider-Ham", JUSTICE, "#ff99cc"),
  hero("SP//dr", PROTECTION, "#ff0000"),
  mutantGenesis(
    hero("Colossus", PROTECTION, "#c7d0db"),
    hero("Shadowcat", AGGRESSION, "#ffc000")
  ),
  hero("Cyclops", LEADERSHIP, "#ff0000"),
  hero("Phoenix", JUSTICE, "#00b050"),
  hero("Wolverine", AGGRESSION, "#fcf600"),
  hero("Storm", LEADERSHIP, "#404040"),
  hero("Gambit", JUSTICE, "#d60093"),
  hero("Rogue", PROTECTION, "#f2f2f2"),
  neXtEvolution(
    hero("Cable", LEADERSHIP, "#c7d0db"),
    hero("Domino", JUSTICE, "#f2f2f2")
  ),
  hero("Psylocke", JUSTICE, "#ff97ff"),
  hero("Angel", PROTECTION, "#0070c0", { hasWideForm: true }),
  hero("X-23", AGGRESSION, "#404040"),
  hero("Deadpool", POOL, "#ff3737"),
];

function flatten(cardsOrSets) {
  return cardsOrSets.flatMap((cardOrSet) => cardOrSet.children || [cardOrSet]);
}

export { scenarios, modules, heroes, aspects, flatten };
