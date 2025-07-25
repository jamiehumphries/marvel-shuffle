import axios from "axios";
import { createWriteStream } from "fs";
import { imageSizeFromFile } from "image-size/fromFile";
import { relative, resolve } from "path";
import { styleText } from "util";
import { compareAndUpdateImage, exec, exists, writeCodeFile } from "./tools.js";

const cardsApi = "https://marvelcdb.com/api/public/cards/";
const imagesSourcePath =
  "https://cerebrodatastorage.blob.core.windows.net/cerebro-cards/official/";

const imagesRoot = "docs/images/deck";

const identityTypeCodes = ["hero", "alter_ego"];
const characterTypeCodes = [...identityTypeCodes, "ally"];
const deckFactionCodes = [
  "aggression",
  "justice",
  "leadership",
  "protection",
  "pool",
  "basic",
];

const nameFixes = {
  "SP//dr Suit": "SP//dr",
};

const teamUpRegex = /^Team-Up \((?:.*\/)?(.*) and (?:.*\/)?(.*)\)\./i;
const linkedRegex = /^Linked \(.*\)\./i;
const minHpRegex =
  /^Play only if your identity has at least (\d+) printed hit points\./i;
const gainsRegex = /gains? the \[\[([^\]]+)\]\] trait/i;

const traitJoinPattern = "(?:,? or |,? and | character and an? |, )";
const traitJoinRegex = new RegExp(traitJoinPattern, "i");

export async function importAllDeckCards(force = false) {
  const { data } = await axios.get(cardsApi);
  const cards = await importCards(data, force);
  const heroes = await importHeroes(data, cards);
  await writeCodeFile("docs/scripts/data/deck.js", cards);
  await writeCodeFile("docs/scripts/data/heroes.js", heroes);
}

async function importCards(data, force) {
  const traits = distinct(
    data
      .filter((entry) => characterTypeCodes.includes(entry.type_code))
      .flatMap((entry) =>
        parseTraits(entry).concat(parseTraits(entry.linked_card)),
      ),
  );

  const traitsForRegex = traits.map((trait) => trait.replaceAll(".", "\\."));
  const traitPattern = `(?:${traitsForRegex.join("|")})`;
  const traitLockRegex = new RegExp(
    `(?:the|a|an|another|each|\\d|X) ((?:(?:\\[\\[)${traitPattern}(?:\\]\\])${traitJoinPattern}?)+) (?:traits?|characters?|cards?)`,
    "i",
  );

  const cardsWithDuplicates = data
    .filter((entry) => deckFactionCodes.includes(entry.faction_code))
    .filter((entry) => !entry.text.match(linkedRegex))
    .sort((c1, c2) => c1.code.localeCompare(c2.code))
    .map((entry) => buildCard(entry, traitLockRegex));

  const cards = deduplicate(cardsWithDuplicates).sort((c1, c2) =>
    c1.id.localeCompare(c2.id),
  );

  await Promise.all(cards.map((card) => fetchImage(card, force)));

  return cards;
}

async function importHeroes(data, cards) {
  const heroSetCards = data
    .filter((entry) => entry.faction_code === "hero")
    .sort((c1, c2) => c1.code.localeCompare(c2.code));

  const combinedCards = {};
  for (const entry of heroSetCards) {
    const hero = (combinedCards[entry.card_set_code] ||= {});
    hero.traits ||= [];
    hero.uniqueDeckCards ||= [];
    switch (entry.type_code) {
      case "hero":
        hero.name ||= mapName(entry.name);
        hero.hp = entry.health;
        hero.traits.push(...parseTraits(entry));
        break;
      case "alter_ego":
        const alterEgo = mapName(entry.name);
        hero.alterEgo = hero.name !== alterEgo ? alterEgo : null;
        hero.traits.push(...parseTraits(entry));
        break;
      default:
        hero.traits.push(...parseGainedTraits(entry));
        if (entry.is_unique) {
          const { name, subname } = entry;
          hero.uniqueDeckCards.push({
            name: mapName(name),
            subname: mapName(subname),
          });
        }
        break;
    }
  }

  const traitLocks = new Set(cards.flatMap((card) => card.traitLocks));

  return Object.values(combinedCards)
    .filter((hero) => !!hero.name)
    .map(({ name, alterEgo, hp, traits, uniqueDeckCards }) => {
      const traitKeys = [...new Set(traits).intersection(traitLocks)];
      return { name, alterEgo, hp, traitKeys, uniqueDeckCards };
    });
}

function buildCard(entry, traitLockRegex) {
  return {
    id: (entry.duplicate_of_code || entry.code).toUpperCase(),
    packs: [mapName(entry.pack_name)],
    aspect: mapName(entry.faction_name),
    aspectCode: entry.faction_code,
    name: mapName(entry.name),
    subname: mapName(entry.subname),
    type: mapName(entry.type_name),
    traits: parseTraits(entry),
    traitLocks: parseTraitLocks(entry, traitLockRegex),
    teamUp: parseTeamUp(entry),
    minHp: parseMinHp(entry),
    landscape: entry.type_code === "player_side_scheme",
    href: entry.url,
  };
}

function deduplicate(cards) {
  return Object.values(
    cards.reduce((deduplicated, card) => {
      if (deduplicated[card.id]) {
        const { packs } = deduplicated[card.id];
        const newPack = card.packs[0];
        if (!packs.includes(newPack)) {
          packs.push(newPack);
        }
      } else {
        deduplicated[card.id] = Object.assign({}, card);
      }
      return deduplicated;
    }, {}),
  );
}

function mapName(name) {
  return name
    ? (nameFixes[name] || name)
        .replace(/(?<=^| )"/, "“")
        .replace(/"(?=$|)/, "”")
        .replace(/(?<=^| )'/, "‘")
        .replaceAll("'", "’")
    : null;
}

function parseTraits(entry) {
  return entry?.traits
    ? entry.traits
        .split(". ")
        .map((trait) => trait.replace(/\.$/, ""))
        .map((trait) => trait.replace(/(?<=\..*)$/, "."))
        .map((trait) => trait.toUpperCase())
    : [];
}

function parseTraitLocks(entry, traitLockRegex) {
  const match = entry.text.match(traitLockRegex);
  return match
    ? match[1]
        .split(traitJoinRegex)
        .map((trait) => trait.replaceAll(/[\[\]]/g, ""))
        .map((trait) => trait.toUpperCase())
    : null;
}

function parseTeamUp(entry) {
  const match = entry.text.match(teamUpRegex);
  if (!match) {
    return null;
  }
  return match ? match.slice(1, 3).map(mapName) : null;
}

function parseMinHp(entry) {
  const match = entry.text.match(minHpRegex);
  return match ? parseInt(match[1]) : null;
}

function parseGainedTraits(entry) {
  const match = entry.text?.match(gainsRegex);
  return match ? [match[1].toUpperCase()] : [];
}

async function fetchImage(card, force) {
  const { id, name } = card;
  const fileName = `${id}.jpg`;
  const url = imagesSourcePath + fileName;
  const outputPath = resolve(imagesRoot, fileName);
  card.imgSrc = "/" + relative("docs", outputPath);

  if (!force && (await exists(outputPath))) {
    return;
  }

  const tempName = `${id}.temp.jpg`;
  const tempPath = resolve(imagesRoot, tempName);

  try {
    const { data } = await axios({ url, responseType: "stream" });
    await new Promise((resolve, reject) => {
      data
        .pipe(createWriteStream(tempPath))
        .on("finish", () => resolve())
        .on("error", (e) => reject(e));
    });
  } catch (error) {
    error.response.data.destroy();
    console.warn(
      styleText("yellow", `Failed to download "${name}" from: ${url}`),
    );
    return;
  }

  const { width, height } = await imageSizeFromFile(tempPath);
  const size = width < height ? "45x64" : "64x45";

  await exec(
    `convert ${tempPath} \
      -strip \
      -trim +repage \
      -resize ${size}^ \
      -gravity center -crop ${size}+0+0 +repage \
      -level 5% \
      ${tempPath}`,
  );

  await compareAndUpdateImage(tempPath, outputPath, 0.15);

  console.log(`Downloaded ${fileName} (${name})`);
}

function distinct(array) {
  return [...new Set(array)];
}
