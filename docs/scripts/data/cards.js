import { heroes as heroData } from "../data/heroes.js?v=af452101";
import { Aspect } from "../models/Aspect.js?v=fd114454";
import { CardSet } from "../models/CardSet.js?v=9e66bdf7";
import { Difficulty } from "../models/Difficulty.js?v=574b97bf";
import { Hero } from "../models/Hero.js?v=d9678b96";
import { Model } from "../models/Model.js?v=02ce5c7a";
import { Modular } from "../models/Modular.js?v=07f6d70e";
import { Scenario } from "../models/Scenario.js?v=ff79f3e0";
import {
  ensureArray,
  filter,
  flatten,
  passesRestriction,
} from "../shared/helpers.js?v=f466f5fb";

// Modifiers
const isCampaign = true;
const isLandscape = true;
const hasBack = true;
const hasGiantForm = true;
const hasWideForm = true;
const isUncounted = true;

// SETS

function cardSet(name, options = {}) {
  return (...cards) => new CardSet(name, cards, options);
}

const coreSet = cardSet("Core Set");
const theGreenGoblin = cardSet("The Green Goblin");
const theWreckingCrew = cardSet("The Wrecking Crew");
const printAndPlay = cardSet("Print-and-Play");
const theRiseOfRedSkull = cardSet("The Rise of Red Skull", { isCampaign });
const theOnceAndFutureKang = cardSet("The Once and Future Kang");
const theGalaxysMostWanted = cardSet("The Galaxy’s Most Wanted", { isCampaign }); // prettier-ignore
const theMadTitansShadow = cardSet("The Mad Titan’s Shadow", { isCampaign });
const theHood = cardSet("The Hood");
const sinisterMotives = cardSet("Sinister Motives", { isCampaign });
const nova = cardSet("Nova");
const ironheart = cardSet("Ironheart");
const spiderHam = cardSet("Spider-Ham");
const spdr = cardSet("SP//dr");
const mutantGenesis = cardSet("Mutant Genesis", { isCampaign });
const mojoMania = cardSet("MojoMania", { isCampaign });
const wolverine = cardSet("Wolverine");
const storm = cardSet("Storm");
const gambit = cardSet("Gambit");
const rogue = cardSet("Rogue");
const neXtEvolution = cardSet("NeXt Evolution", { isCampaign });
const deadpool = cardSet("Deadpool");
const ageOfApocalypse = cardSet("Age of Apocalypse", { isCampaign });
const iceman = cardSet("Iceman");
const jubilee = cardSet("Jubilee");
const nightcrawler = cardSet("Nightcrawler");
const magneto = cardSet("Magneto");
const agentsOfShield = cardSet("Agents of S.H.I.E.L.D.", { isCampaign });
const blackPanther = cardSet("Black Panther");
const silk = cardSet("Silk");
const falcon = cardSet("Falcon");
const winterSoldier = cardSet("Winter Soldier");
const tricksterTakeover = cardSet("Trickster Takeover");
const civilWar = cardSet("Civil War");
const hercules = cardSet("Hercules");

// MODULARS

function modular(name, options = {}) {
  return new Modular(name, options);
}

function schemeGroup(groupName, stagesBySet) {
  const group = { name: groupName };

  group.allSchemes = [];
  group.stages = [];

  for (const [setName, stages] of Object.entries(stagesBySet)) {
    const parentSetSlug = Model.buildSlug(...setName.split(/(?=[A-Z])/g));
    group[setName] = cardSet(groupName, { parentSetSlug });
    group[setName].schemes = [];
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      group.stages[i] ||= [];
      for (const schemeName of stage) {
        const subname = `Main Scheme - Stage ${i + 1}`;
        const backName = `${groupName} - ${subname}`;
        const scheme = modular(schemeName, {
          subname,
          isLandscape,
          hasBack: backName,
        });
        group.allSchemes.push(scheme);
        group.stages[i].push(scheme);
        group[setName].schemes.push(scheme);
      }
    }
  }

  group.schemes = (...defaultSchemes) => {
    return {
      schemes: defaultSchemes.map((name, i) => {
        const schemes = group.stages[i];
        const defaultScheme = findModular(name, schemes);
        const otherSchemes = filter(schemes, defaultScheme);
        return [defaultScheme, ...otherSchemes];
      }),
      excludedSet: group.excludedSet,
      minModularsVariability: 1,
    };
  };

  return group;
}

// prettier-ignore
const registration = schemeGroup("Registration", {
  civilWar: [
    [
      "S.H.I.E.L.D. Recruits",
      "Homeland Security",
      "Public Outrage",
      "Cut Off Support",
    ],
    [
      "The Initiative",
      "Hunting Rebel Heroes",
      "No Going Back",
      "Negative Zone Prison",
    ],
  ],
});

// prettier-ignore
const resistance = schemeGroup("Resistance", {
  civilWar: [
    [
      "Gathering Support",
      "Rallying Call",
      "Open Rebellion",
      "Going Underground",
    ],
    [
      "Neighbourhood Protectors",
      "Guerilla Warfare",
      "Secret Avengers",
      "Superhero Jailbreak",
    ],
  ],
});

registration.excludedSet = resistance.name;
resistance.excludedSet = registration.name;

// prettier-ignore
export const modulars = [
  coreSet(
    modular("Bomb Scare", { isLandscape }),
    modular("Masters of Evil", { isLandscape }),
    modular("Under Attack", { isLandscape }),
    modular("Legions of Hydra", { isLandscape }),
    modular("The Doomsday Chair", { isLandscape }),
  ),
  theGreenGoblin(
    modular("Goblin Gimmicks"),
    modular("A Mess of Things", { isLandscape }),
    modular("Power Drain", { isLandscape }),
    modular("Running Interference", { isLandscape }),
  ),
  printAndPlay(
    modular("Kree Fanatic"),
  ),
  theRiseOfRedSkull(
    modular("Experimental Weapons"),
    modular("Hydra Assault"),
    modular("Weapon Master"),
    modular("Hydra Patrol", { isLandscape }),
  ),
  theOnceAndFutureKang(
    modular("Temporal", { isLandscape }),
    modular("Anachronauts", { isLandscape }),
    modular("Master of Time"),
  ),
  theGalaxysMostWanted(
    modular("Band of Badoon"),
    modular("Galactic Artifacts"),
    modular("Kree Militants"),
    modular("Menagerie Medley"),
    modular("Space Pirates"),
    modular("Ship Command", { hasBack: Aspect }),
    modular("Power Stone"),
    modular("Badoon Headhunter"),
  ),
  theMadTitansShadow(
    modular("Black Order", { isLandscape }),
    modular("Armies of Titan"),
    modular("Children of Thanos"),
    modular("Infinity Gauntlet"),
    modular("Legions of Hel", { isLandscape }),
    modular("Frost Giants"),
    modular("Enchantress"),
  ),
  theHood(
    modular("Beasty Boys", { isLandscape }),
    modular("Brothers Grimm"),
    modular("Crossfire’s Crew"),
    modular("Mister Hyde"),
    modular("Ransacked Armory"),
    modular("Sinister Syndicate"),
    modular("State of Emergency"),
    modular("Streets of Mayhem"),
    modular("Wrecking Crew"),
  ),
  sinisterMotives(
    modular("City in Chaos", { isLandscape }),
    modular("Down to Earth"),
    modular("Goblin Gear"),
    modular("Guerilla Tactics"),
    modular("Osborn Tech"),
    modular("Personal Nightmare"),
    modular("Sinister Assault"),
    modular("Symbiotic Strength"),
    modular("Whispers of Paranoia"),
  ),
  nova(
    modular("Armadillo"),
  ),
  ironheart(
    modular("Zzzax"),
  ),
  spiderHam(
    modular("The Inheritors"),
  ),
  spdr(
    modular("Iron Spider’s Sinister Six"),
  ),
  mutantGenesis(
    modular("Brotherhood", { isLandscape }),
    modular("Mystique"),
    modular("Zero Tolerance", { isLandscape }),
    modular("Sentinels"),
    modular("Acolytes", { isLandscape }),
    modular("Future Past", { isLandscape }),
  ),
  mojoMania(
    modular("Crime", { traits: "Show" }),
    modular("Fantasy", { traits: "Show" }),
    modular("Horror", { traits: "Show" }),
    modular("Sci-Fi", { traits: "Show" }),
    modular("Sitcom", { traits: "Show" }),
    modular("Western", { traits: "Show" }),
  ),
  wolverine(
    modular("Deathstrike"),
  ),
  storm(
    modular("Shadow King"),
  ),
  gambit(
    modular("Exodus"),
  ),
  rogue(
    modular("Reavers", { isLandscape }),
  ),
  neXtEvolution(
    modular("Military Grade"),
    modular("Mutant Slayers", { isLandscape }),
    modular("Nasty Boys", { isLandscape }),
    modular("Black Tom Cassidy"),
    modular("Flight"),
    modular("Super Strength"),
    modular("Telepathy"),
    modular("Extreme Measures", { isLandscape }),
    modular("Mutant Insurrection", { isLandscape }),
  ),
  ageOfApocalypse(
    modular("Infinites"),
    modular("Dystopian Nightmare", { isLandscape }),
    modular("Hounds", { isLandscape }),
    modular("Dark Riders", { isLandscape }),
    modular("Savage Land"),
    modular("Genosha"),
    modular("Blue Moon"),
    modular("Celestial Tech"),
    modular("Clan Akkaba"),
  ),
  iceman(
    modular("Sauron"),
  ),
  jubilee(
    modular("Arcade"),
  ),
  nightcrawler(
    modular("Crazy Gang", { isLandscape }),
  ),
  magneto(
    modular("Hellfire"),
  ),
  agentsOfShield(
    modular("A.I.M. Abduction"),
    modular("A.I.M. Science"),
    modular("Batroc’s Brigade", { isLandscape }),
    modular("Scientist Supreme"),
    modular("Gravitational Pull", { traits: "Thunderbolt" }),
    modular("Hard Sound", { traits: "Thunderbolt" }),
    modular("Pale Little Spider", { traits: "Thunderbolt" }),
    modular("Power of the Atom", { traits: "Thunderbolt" }),
    modular("Supersonic", { traits: "Thunderbolt" }),
    modular("The Leaper", { traits: "Thunderbolt" }),
    modular("S.H.I.E.L.D."),
  ),
  blackPanther(
    modular("Extreme Risk", { traits: "Thunderbolt" }),
  ),
  silk(
    modular("Growing Strong", { traits: "Thunderbolt" }),
  ),
  falcon(
    modular("Techno", { traits: "Thunderbolt" }),
  ),
  winterSoldier(
    modular("Whiteout", { traits: "Thunderbolt" }),
  ),
  tricksterTakeover(
    modular("Trickster Magic", { isLandscape }),
  ),
  civilWar(
    registration.civilWar(
      modular("Mighty Avengers"),
      modular("The Initiative", { isLandscape }),
      modular("Maria Hill"),
      modular("Dangerous Recruits", { isLandscape }),
      modular("Cape-Killer"),
      modular("Martial Law"),
      modular("Heroes for Hire", { isLandscape }),
      modular("Paladin"),
    ),
    resistance.civilWar(
      modular("New Avengers", { isLandscape }),
      modular("Secret Avengers", { isLandscape }),
      modular("Namor"),
      modular("Atlanteans"),
      modular("Spider-Man"),
      modular("Defenders", { isLandscape }),
      modular("Hell’s Kitchen", { isLandscape }),
      modular("Cloak & Dagger", { isLandscape }),
    ),
  ),
  hercules(
    modular("All Versus All", { isLandscape }),
  ),
];

export const extraModulars = [
  // Scenario specific modulars
  modular("Magneto", { hasBack }),
  modular("Prelates", { hasBack }),
  modular("S.H.I.E.L.D. Executive Board", { hasBack }),
  modular("Executive Board Evidence", { hasBack }),
  // Uncounted modulars
  modular("Longshot", { isUncounted }),
  modular("Hope Summers", { hasBack: Aspect, isUncounted }),
  // Dreadpool for ‘Pool aspect
  modular("Dreadpool", { requiredReason: "for ‘Pool aspect" }),
  // Civil War main schemes
  ...registration.allSchemes,
  ...resistance.allSchemes,
];

// SCENARIOS

const customisationModulars = flatten(modulars);
const allModulars = customisationModulars.concat(extraModulars);

function findModulars(names) {
  return ensureArray(names).map((name) => findModular(name));
}

function findModular(name, searchArray = null) {
  searchArray ||= allModulars;
  const modular = searchArray.find((modular) => modular.name === name);
  if (!modular) {
    throw new Error(`Could not find modular named "${name}".`);
  }
  return modular;
}

function scenario(name, modularNamesOrNumber, color, options = {}) {
  if (options.requiredTrait) {
    options.exclude = customisationModulars.filter(
      (modular) => !ensureArray(modular.traits).includes(options.requiredTrait),
    );
  }

  if (options.excludedSet) {
    options.hardExclude = customisationModulars.filter(
      (modular) => modular.parent?.name === options.excludedSet,
    );
  }

  options.required &&= findModulars(options.required);

  const modularsOrNumber =
    typeof modularNamesOrNumber === "number"
      ? modularNamesOrNumber
      : findModulars(modularNamesOrNumber);

  return new Scenario(name, modularsOrNumber, color, options);
}

// prettier-ignore
export const scenarios = [
  coreSet(
    scenario("Rhino", "Bomb Scare", "#d0cece"),
    scenario("Klaw", "Masters of Evil", "#7030a0"),
    scenario("Ultron", "Under Attack", "#ed7d31"),
  ),
  theGreenGoblin(
    scenario("Risky Business", "Goblin Gimmicks", "#00b050",  { hasBack }),
    scenario("Mutagen Formula", "Goblin Gimmicks", "#660066"),
  ),
  theWreckingCrew(
    scenario("Wrecking Crew", 0, "#ffc000"),
  ),
  theRiseOfRedSkull(
    scenario("Crossbones", ["Hydra Assault", "Weapon Master", "Legions of Hydra"], "#404040", { required: "Experimental Weapons" }),
    scenario("Absorbing Man", "Hydra Patrol", "#7030a0"),
    scenario("Taskmaster", "Weapon Master", "#c9c9c9", { required: "Hydra Patrol" }),
    scenario("Zola", "Under Attack", "#adc1e5"),
    scenario("Red Skull", ["Hydra Assault", "Hydra Patrol"], "#ff0000"),
  ),
  theOnceAndFutureKang(
    scenario("Kang", "Temporal", "#00b050"),
  ),
  theGalaxysMostWanted(
    scenario("Brotherhood of Badoon", "Band of Badoon", "#660066", { required: "Ship Command" }),
    scenario("Infiltrate the Museum", "Menagerie Medley", "#c00000", { required: "Galactic Artifacts" }),
    scenario("Escape the Museum", "Menagerie Medley", "#afdc7e", { required: ["Galactic Artifacts", "Ship Command"], hasBack }),
    scenario("Nebula", "Space Pirates", "#a9cbe9", { required: ["Power Stone", "Ship Command"] }),
    scenario("Ronan the Accuser", "Kree Militants", "#305496", { required: ["Power Stone", "Ship Command"] }),
  ),
  theMadTitansShadow(
    scenario("Ebony Maw", ["Armies of Titan", "Black Order"], "#404040"),
    scenario("Tower Defense", "Armies of Titan", "#c7d0db", { hasBack }),
    scenario("Thanos", ["Black Order", "Children of Thanos"], "#9900ff", { required: "Infinity Gauntlet" }),
    scenario("Hela", ["Legions of Hel", "Frost Giants"], "#b4d79d", { hasBack }),
    scenario("Loki", ["Enchantress", "Frost Giants"], "#ffc000", { required: "Infinity Gauntlet" }),
  ),
  theHood(
    scenario("The Hood", 7, "#c00000"),
  ),
  sinisterMotives(
    scenario("Sandman", "Down to Earth", "#ffcc66", { required: "City in Chaos" }),
    scenario("Venom", "Down to Earth", "#404040", { required: "Symbiotic Strength" }),
    scenario("Mysterio", "Whispers of Paranoia", "#7030a0", { required: "Personal Nightmare" }),
    scenario("The Sinister Six", 0, "#f4ad7c", { required: "Guerilla Tactics" }),
    scenario("Venom Goblin", "Goblin Gear", "#375623", { required: "Symbiotic Strength" }),
  ),
  mutantGenesis(
    scenario("Sabretooth", ["Brotherhood", "Mystique"], "#ffc000"),
    scenario("Project Wideawake", "Sentinels", "#9933ff", { required: "Zero Tolerance" }),
    scenario("Master Mold", "Zero Tolerance", "#7030a0", { required: ["Sentinels", "Magneto"] }),
    scenario("Mansion Attack", "Mystique", "#d0cece", { required: "Brotherhood", hasBack: Modular }),
    scenario("Magneto", "Acolytes", "#c00000"),
  ),
  mojoMania(
    scenario("Magog", 1, "#e66914", { hasBack }),
    scenario("Spiral", 3, "#acccea", { requiredTrait: "Show", hasBack }),
    scenario("Mojo", 1, "#ffcc00", { requiredTrait: "Show", additionalModularsPerHero: 1 }),
  ),
  neXtEvolution(
    scenario("Morlock Siege", ["Military Grade", "Mutant Slayers"], "#00b050", { hasBack: Aspect }),
    scenario("On the Run", ["Military Grade", "Nasty Boys"], "#7030a0", { required: "Mutant Slayers", hasBack }),
    scenario("Juggernaut", "Black Tom Cassidy", "#c00000", { required: "Hope Summers" }),
    scenario("Mister Sinister", "Nasty Boys", "#305496", { required: ["Flight", "Super Strength", "Telepathy", "Hope Summers"] }),
    scenario("Stryfe", ["Extreme Measures", "Mutant Insurrection"], "#ff0000", { required: "Hope Summers" }),
  ),
  ageOfApocalypse(
    scenario("Unus", ["Dystopian Nightmare"], "#00b050", { required: "Infinites" }),
    scenario("Four Horsemen", ["Dystopian Nightmare", "Hounds"], "#ffc000", { hasBack: Modular }),
    scenario("Apocalypse", ["Dark Riders", "Infinites"], "#305496", { required: "Prelates", hasBack }),
    scenario("Dark Beast", ["Dystopian Nightmare"], "#808080", { required: ["Blue Moon", "Genosha", "Savage Land"] }),
    scenario("En Sabah Nur", ["Celestial Tech", "Clan Akkaba"], "#1e365e", { hasBack, hasGiantForm }),
  ),
  agentsOfShield(
    scenario("Black Widow", ["A.I.M. Abduction", "A.I.M. Science"], "#404040"),
    scenario("Batroc", ["A.I.M. Abduction", "Batroc’s Brigade"], "#9f5b33", { hasBack }),
    scenario("M.O.D.O.K.", "Scientist Supreme", "#ffc000", { hasBack }),
    scenario("Thunderbolts", 1, "#0070c0", { requiredTrait: "Thunderbolt", additionalModularsPerHero: 1, hasBack }),
    scenario("Baron Zemo", ["Scientist Supreme", "S.H.I.E.L.D."], "#a23276", { required: ["S.H.I.E.L.D. Executive Board", "Executive Board Evidence"], hasBack }),
  ),
  tricksterTakeover(
    scenario("Enchantress", "Trickster Magic", "#00b050"),
    scenario("God of Lies", "Trickster Magic", "#ffc000", { hasBack }),
  ),
  civilWar(
    registration.civilWar(
      scenario("Iron Man", ["Mighty Avengers", "The Initiative", "Maria Hill", "Dangerous Recruits"], "#ffc000",
        { ...registration.schemes("Cut Off Support", "Negative Zone Prison") }),
      scenario("Captain Marvel", ["Cape-Killer", "Martial Law", "Heroes for Hire", "Paladin"], "#305496",
        { ...registration.schemes("S.H.I.E.L.D. Recruits", "Hunting Rebel Heroes") }),
    ).withExtraOptions(...registration.civilWar.schemes),
    resistance.civilWar(
      scenario("Captain America", ["New Avengers", "Secret Avengers", "Namor", "Atlanteans"], "#0070c0",
        { ...resistance.schemes("Gathering Support", "Secret Avengers") }),
      scenario("Spider-Woman", ["Spider-Man", "Defenders", "Hell’s Kitchen", "Cloak & Dagger"], "#ffc000",
        { ...resistance.schemes("Open Rebellion", "Neighbourhood Protectors") }),
    ).withExtraOptions(...resistance.civilWar.schemes),
  ),
];

// DIFFICULTIES

function difficulty(name) {
  return new Difficulty(name);
}

// prettier-ignore
export const difficulties = [
  difficulty("Standard"),
  difficulty("Standard II"),
  difficulty("Standard III"),
  difficulty("Expert"),
  difficulty("Expert II"),
]

// ASPECTS

function aspect(name, options = {}) {
  options.required &&= findModulars(options.required);
  return new Aspect(name, options);
}

const AGGRESSION = aspect("Aggression");
const JUSTICE = aspect("Justice");
const LEADERSHIP = aspect("Leadership");
const PROTECTION = aspect("Protection");
const POOL = aspect("‘Pool", { required: "Dreadpool" });

// prettier-ignore
export const aspects = [
  coreSet(
    AGGRESSION,
    JUSTICE,
    LEADERSHIP,
    PROTECTION,
  ),
  deadpool(
    POOL,
  ),
];

// HEROES

function hero(name, alterEgo, aspects, color, options = {}) {
  const data = heroData.find(
    (entry) => entry.name === name && entry.alterEgo === alterEgo,
  );

  const traitKeys = data?.traitKeys || [];
  const hp = data?.hp || 0;
  const exludedDeckCards = data?.exludedDeckCards || [];

  if (options.exclude) {
    exludedDeckCards.push(...ensureArray(options.exclude));
  }

  aspects = ensureArray(aspects);

  if (options.include) {
    let { resources, traits, type } = options.include;
    resources = ensureArrayOrNull(resources, true);
    traits = ensureArrayOrNull(traits, true);
    type = ensureArrayOrNull(type);
    options.include = (card) =>
      passesRestriction(resources, card.resources) &&
      passesRestriction(traits, card.traits) &&
      passesRestriction(type, [card.type]);
  }

  return new Hero(
    name,
    alterEgo,
    aspects,
    color,
    traitKeys,
    hp,
    exludedDeckCards,
    options,
  );
}

function ensureArrayOrNull(possibleArray, toUpperCase = false) {
  return possibleArray
    ? ensureArray(possibleArray).map((item) =>
        toUpperCase ? item.toUpperCase() : item,
      )
    : null;
}

// prettier-ignore
export const heroes = [
  coreSet(
    hero("Spider-Man", "Peter Parker", JUSTICE, "#ff0000"),
    hero("Captain Marvel", "Carol Danvers", LEADERSHIP, "#305496"),
    hero("She-Hulk", "Jennifer Walters", AGGRESSION, "#00b050"),
    hero("Iron Man", "Tony Stark", AGGRESSION, "#ffc000"),
    hero("Black Panther", "T’Challa", PROTECTION, "#404040"),
  ),
  hero("Captain America", "Steve Rogers", LEADERSHIP, "#0070c0"),
  hero("Ms. Marvel", "Kamala Khan", PROTECTION, "#ff0000"),
  hero("Thor", "Odinson", AGGRESSION, "#ffc000"),
  hero("Black Widow", "Natasha Romanoff", JUSTICE, "#404040"),
  hero("Doctor Strange", "Stephen Strange", PROTECTION, "#c00000"),
  hero("Hulk", "Bruce Banner", AGGRESSION, "#00b050"),
  theRiseOfRedSkull(
    hero("Hawkeye", "Clint Barton", LEADERSHIP, "#7030a0"),
    hero("Spider-Woman", "Jessica Drew", [AGGRESSION, JUSTICE], "#ffc000"),
  ),
  hero("Ant-Man", "Scott Lang", LEADERSHIP, "#c00000", { hasGiantForm }),
  hero("Wasp", "Nadia Van Dyne", AGGRESSION, "#404040", { hasGiantForm }),
  hero("Quicksilver", "Pietro Maximoff", PROTECTION, "#81deff"),
  hero("Scarlet Witch", "Wanda Maximoff", JUSTICE, "#ff0000"),
  theGalaxysMostWanted(
    hero("Groot", null, PROTECTION, "#996633"),
    hero("Rocket Raccoon", null, AGGRESSION, "#c00000"),
  ),
  hero("Star-Lord", "Peter Quill", LEADERSHIP, "#c4cdda"),
  hero("Gamora", null, AGGRESSION, "#00b050", { include: { type: "Event", traits: ["Attack", "Thwart"] } }),
  hero("Drax", null, PROTECTION, "#afdc7e"),
  hero("Venom", "Flash Thompson", JUSTICE, "#404040"),
  theMadTitansShadow(
    hero("Spectrum", "Monica Rambeau", LEADERSHIP, "#f2f2f2"),
    hero("Adam Warlock", null, [AGGRESSION, JUSTICE, LEADERSHIP, PROTECTION], "#c00000"),
  ),
  hero("Nebula", null, JUSTICE, "#a9cbe9"),
  hero("War Machine", "James Rhodes", LEADERSHIP, "#808080"),
  hero("Valkyrie", "Brunnhilde", AGGRESSION, "#404040"),
  hero("Vision", null, PROTECTION, "#ff3300"),
  sinisterMotives(
    hero("Ghost-Spider", "Gwen Stacy", PROTECTION, "#f2f2f2"),
    hero("Spider-Man", "Miles Morales", JUSTICE, "#404040"),
  ),
  hero("Nova", "Sam Alexander", AGGRESSION, "#ffc000"),
  hero("Ironheart", "Riri Williams", LEADERSHIP, "#b4c6e7"),
  hero("Spider-Ham", "Peter Porker", JUSTICE, "#ff99cc"),
  hero("SP//dr", "Peni Parker", PROTECTION, "#ff0000"),
  mutantGenesis(
    hero("Colossus", "Piotr Rasputin", PROTECTION, "#c7d0db"),
    hero("Shadowcat", "Kitty Pryde", AGGRESSION, "#ffc000"),
  ),
  hero("Cyclops", "Scott Summers", LEADERSHIP, "#ff0000", { include: { type: "Ally", traits: "X-Men" } }),
  hero("Phoenix", "Jean Grey", JUSTICE, "#00b050"),
  hero("Wolverine", "Logan", AGGRESSION, "#fcf600"),
  hero("Storm", "Ororo Munroe", LEADERSHIP, "#404040"),
  hero("Gambit", "Remy LeBeau", JUSTICE, "#d60093"),
  hero("Rogue", "Anna Marie", PROTECTION, "#f2f2f2"),
  neXtEvolution(
    hero("Cable", "Nathan Summers", LEADERSHIP, "#c7d0db", { include: { type: "Player Side Scheme" } }),
    hero("Domino", "Neena Thurman", JUSTICE, "#f2f2f2"),
  ),
  hero("Psylocke", "Betsy Braddock", JUSTICE, "#ff97ff"),
  hero("Angel", "Warren Worthington III", PROTECTION, "#0070c0", { hasWideForm }),
  hero("X-23", "Laura Kinney", AGGRESSION, "#404040"),
  hero("Deadpool", "Wade Wilson", POOL, "#ff3737"),
  ageOfApocalypse(
    hero("Bishop", "Lucas Bishop", LEADERSHIP, "#305496"),
    hero("Magik", "Illyana Rasputin", AGGRESSION, "#ffc000"),
  ),
  hero("Iceman", "Bobby Drake", AGGRESSION, "#81deff"),
  hero("Jubilee", "Jubilation Lee", JUSTICE, "#fcf600"),
  hero("Nightcrawler", "Kurt Wagner", PROTECTION, "#c00000"),
  hero("Magneto", "Erik Lehnsherr", LEADERSHIP, "#c7d0db"),
  agentsOfShield(
    hero("Maria Hill", null, LEADERSHIP, "#b4c6e7", { include: { type: "Support", traits: "S.H.I.E.L.D." } }),
    hero("Nick Fury", null, JUSTICE, "#404040"),
  ),
  hero("Black Panther", "Shuri", JUSTICE, "#7030a0"),
  hero("Silk", "Cindy Moon", PROTECTION, "#f2f2f2"),
  hero("Falcon", "Sam Wilson", LEADERSHIP, "#c00000"),
  hero("Winter Soldier", "Bucky Barnes", AGGRESSION, "#c7d0db"),
  civilWar(
    hero("Hulkling", "Teddy Altman", PROTECTION, "#00b050"),
    hero("Tigra", "Greer Nelson", AGGRESSION, "#ed7d31", { exclude: { name: "Tigra", subname: "Greer Grant Nelson" } }),
  ),
  hero("Wonder Man", "Simon Williams", JUSTICE, "#ff0000", { include: { type: "Event", resources: "Energy" } }),
  hero("Hercules", null, LEADERSHIP, "#ffc000"),
];
