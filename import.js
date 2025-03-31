import axios from "axios";
import { createWriteStream } from "fs";
import { imageSizeFromFile } from "image-size/fromFile";
import { relative, resolve } from "path";
import { exec, exists, writeCodeFile } from "./tools.js";

const cardsApi = "https://marvelcdb.com/api/public/cards/";
const imagesSourcePath =
  "https://cerebrodatastorage.blob.core.windows.net/cerebro-cards/official/";

const imagesRoot = "docs/images/deck";

const characterTypeCodes = ["hero", "ally"];
const deckFactionCodes = [
  "aggression",
  "justice",
  "leadership",
  "protection",
  "pool",
  "basic",
];

const nameFixes = {
  "Galaxy's Most Wanted": "The Galaxy’s Most Wanted",
};

const teamUpRegex = /^Team-Up \((.*) and (.*)\)\./;
const linkedRegex = /^Linked \(.*\)\./;
const minHpRegex =
  /^Play only if your identity has at least (\d+) printed hit points\./;

export async function updateDeckCards(force = false) {
  const { data } = await axios.get(cardsApi);

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
    `(?:the|a|an|another|each|\\d|X) ((?:(?:\\[\\[)?${traitPattern}(?:\\]\\])?(?:,? or |,? and |, )?)+) (?:traits?|characters?|cards?)`,
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

  const path = "docs/scripts/data/deck.js";
  await writeCodeFile(path, cards);
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
        .split(/(?:,? or |,? and |, )/)
        .map((trait) => trait.replaceAll(/[\[\]]/g, ""))
        .map((trait) => trait.toUpperCase())
    : null;
}

function parseTeamUp(entry) {
  const match = entry.text.match(teamUpRegex);
  return match ? match.slice(1, 3) : null;
}

function parseMinHp(entry) {
  const match = entry.text.match(minHpRegex);
  return match ? parseInt(match[1]) : null;
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

  try {
    const { data } = await axios({ url, responseType: "stream" });
    await new Promise((resolve, reject) => {
      data
        .pipe(createWriteStream(outputPath))
        .on("finish", () => resolve())
        .on("error", (e) => reject(e));
    });
  } catch (error) {
    console.warn(`Failed to download "${name}" from: ${url}`);
    console.warn(error);
    return;
  }

  const { width, height } = await imageSizeFromFile(outputPath);
  const outputSize = width < height ? "45x64" : "64x45";

  await exec(
    `convert ${outputPath} \
      -strip \
      -trim +repage \
      -resize ${outputSize}^ \
      -gravity center -crop ${outputSize}+0+0 +repage \
      -level 5% \
      ${outputPath}`,
  );

  console.log(`Downloaded ${fileName} (${name})`);
}

function distinct(array) {
  return [...new Set(array)];
}
