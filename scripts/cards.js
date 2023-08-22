import {
  CardSet,
  Scenario,
  Module,
  Hero,
  Aspect,
} from "./options.js?v=next-evolution";

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
    module("Ship Command")
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
  (cardOrSet) => cardOrSet.children || [cardOrSet]
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

function scenario(name, moduleNamesOrNumber, options = {}) {
  options.exclude &&= findModules(options.exclude);
  const modulesOrNumber =
    typeof moduleNamesOrNumber === "number"
      ? moduleNamesOrNumber
      : findModules(moduleNamesOrNumber);
  return new Scenario(name, modulesOrNumber, options);
}

// prettier-ignore
const scenarios = [
  coreSet(
    scenario("Rhino", "Bomb Scare"),
    scenario("Klaw", "Masters of Evil"),
    scenario("Ultron", "Under Attack")
  ),
  theGreenGoblin(
    scenario("Risky Business", "Goblin Gimmicks",  { hasBack: true }),
    scenario("Mutagen Formula", "Goblin Gimmicks")
  ),
  theWreckingCrew(
    scenario("Wrecking Crew", 0)
  ),
  theRiseOfRedSkull(
    scenario("Crossbones", ["Hydra Assault", "Weapon Master", "Legions of Hydra"], { exclude: "Experimental Weapons" }),
    scenario("Absorbing Man", "Hydra Patrol"),
    scenario("Taskmaster", "Weapon Master", { exclude: "Hydra Patrol" }),
    scenario("Zola", "Under Attack"),
    scenario("Red Skull", ["Hydra Assault", "Hydra Patrol"])
  ),
  theOnceAndFutureKang(
    scenario("Kang", "Temporal")
  ),
  theGalaxysMostWanted(
    scenario("Brotherhood of Badoon", "Band of Badoon", { exclude: "Ship Command" }),
    scenario("Infiltrate the Museum", "Menagerie Medley", { exclude: "Galactic Artifacts" }),
    scenario("Escape the Museum", "Menagerie Medley", { exclude: ["Galactic Artifacts", "Ship Command"], hasBack: true }),
    scenario("Nebula", "Space Pirates", { exclude: "Ship Command" }),
    scenario("Ronan the Accuser", "Kree Militants", { exclude: "Ship Command" })
  ),
  theMadTitansShadow(
    scenario("Ebony Maw", ["Armies of Titan", "Black Order"]),
    scenario("Tower Defense", "Armies of Titan", { hasBack: true }),
    scenario("Thanos", ["Black Order", "Children of Thanos"], { exclude: "Infinity Gauntlet" }),
    scenario("Hela", ["Legions of Hel", "Frost Giants"], { hasBack: true }),
    scenario("Loki", ["Enchantress", "Frost Giants"], { exclude: "Infinity Gauntlet" })
  ),
  theHood(
    scenario("The Hood", 7)
  ),
  sinisterMotives(
    scenario("Sandman", "Down to Earth", { exclude: "City in Chaos" }),
    scenario("Venom", "Down to Earth", { exclude: "Symbiotic Strength" }),
    scenario("Mysterio", "Whispers of Paranoia", { exclude: "Personal Nightmare" }),
    scenario("The Sinister Six", 0, { exclude: "Guerilla Tactics" }),
    scenario("Venom Goblin", "Goblin Gear", { exclude: "Symbiotic Strength" })
  ),
  mutantGenesis(
    scenario("Sabretooth", ["Brotherhood", "Mystique"]),
    scenario("Project Wideawake", "Sentinels", { exclude: "Zero Tolerance" }),
    scenario("Master Mold", "Zero Tolerance", { exclude: "Sentinels" }),
    scenario("Mansion Attack", "Mystique", { exclude: "Brotherhood", hasBack: true }),
    scenario("Magneto", "Acolytes")
  ),
  mojoMania(
    scenario("Magog", 1, { hasBack: true }),
    scenario("Spiral", 3, { exclude: nonMojoManiaModules, hasBack: true }),
    scenario("Mojo", 2, { exclude: nonMojoManiaModules })
  ),
  neXtEvolution(
    scenario("Morlock Siege", ["Military Grade", "Mutant Slayers"], { hasBack: true }),
    scenario("On the Run", ["Military Grade", "Nasty Boys"], { exclude: "Mutant Slayers", hasBack: true }),
    scenario("Juggernaut", "Black Tom Cassidy", { exclude: "Hope Summers" }),
    scenario("Mister Sinister", "Nasty Boys", { exclude: ["Flight", "Super Strength", "Telepathy", "Hope Summers"] }),
    scenario("Stryfe", ["Extreme Measures", "Mutant Insurrection"], { exclude: "Hope Summers" })
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

function hero(name, aspects, options) {
  aspects = ensureArray(aspects);
  return new Hero(name, aspects, options);
}

// prettier-ignore
const heroes = [
  coreSet(
    hero("Spider-Man", JUSTICE, { alterEgo: "Peter Parker" }),
    hero("Captain Marvel", LEADERSHIP),
    hero("She-Hulk", AGGRESSION),
    hero("Iron Man", AGGRESSION),
    hero("Black Panther", PROTECTION)
  ),
  hero("Captain America", LEADERSHIP),
  hero("Ms. Marvel", PROTECTION),
  hero("Thor", AGGRESSION),
  hero("Black Widow", JUSTICE),
  hero("Doctor Strange", PROTECTION),
  hero("Hulk", AGGRESSION),
  theRiseOfRedSkull(
    hero("Hawkeye", LEADERSHIP),
    hero("Spider-Woman", [AGGRESSION, JUSTICE])
  ),
  hero("Ant-Man", LEADERSHIP, { hasGiantForm: true }),
  hero("Wasp", AGGRESSION, { hasGiantForm: true }),
  hero("Quicksilver", PROTECTION),
  hero("Scarlet Witch", JUSTICE),
  theGalaxysMostWanted(
    hero("Groot", PROTECTION),
    hero("Rocket Raccoon", AGGRESSION)
  ),
  hero("Star-Lord", LEADERSHIP),
  hero("Gamora", AGGRESSION),
  hero("Drax", PROTECTION),
  hero("Venom", JUSTICE),
  theMadTitansShadow(
    hero("Spectrum", LEADERSHIP),
    hero("Adam Warlock", [AGGRESSION, JUSTICE, LEADERSHIP, PROTECTION])
  ),
  hero("Nebula", JUSTICE),
  hero("War Machine", LEADERSHIP),
  hero("Valkyrie", AGGRESSION),
  hero("Vision", PROTECTION),
  sinisterMotives(
    hero("Ghost-Spider", PROTECTION),
    hero("Spider-Man", JUSTICE, { alterEgo: "Miles Morales" })
  ),
  hero("Nova", AGGRESSION),
  hero("Ironheart", LEADERSHIP),
  hero("Spider-Ham", JUSTICE),
  hero("SP//dr", PROTECTION),
  mutantGenesis(
    hero("Colossus", PROTECTION),
    hero("Shadowcat", AGGRESSION)
  ),
  hero("Cyclops", LEADERSHIP),
  hero("Phoenix", JUSTICE),
  hero("Wolverine", AGGRESSION),
  hero("Storm", LEADERSHIP),
  hero("Gambit", JUSTICE),
  hero("Rogue", PROTECTION),
  neXtEvolution(
    hero("Cable", LEADERSHIP),
    hero("Domino", JUSTICE)
  ),
  hero("Psylocke", JUSTICE),
  hero("Angel", PROTECTION, { hasWideForm: true }),
  hero("X-23", AGGRESSION),
  hero("Deadpool", POOL),
];

export { scenarios, modules, heroes, aspects };
