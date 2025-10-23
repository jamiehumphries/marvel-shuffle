import axios from "axios";
import { openSync as openFontSync } from "fontkit";
import { createWriteStream } from "fs";
import { imageSizeFromFile } from "image-size/fromFile";
import { relative, resolve } from "path";
import { styleText } from "util";
import { compareAndUpdateImage, exec, exists, writeCodeFile } from "./tools.js";

const cardsApi = "https://marvelcdb.com/api/public/cards/";
const imagesSourcePath =
  "https://cerebrodatastorage.blob.core.windows.net/cerebro-cards/official/";

const imagesRoot = "docs/images/deck";
const fallbackImgSrc = imgSrc(resolve(imagesRoot, "back.png"));

const identityTypeCodes = ["hero", "alter_ego"];
const characterTypeCodes = [...identityTypeCodes, "ally"];

const nameFixes = {
  "SP//dr Suit": "SP//dr",
};

const teamUpRegex = /^Team-Up \((?:.*\/)?(.*) and (?:.*\/)?(.*)\)\./i;
const linkedRegex = /^Linked \(.*\)\./i;
const minHpRegex =
  /^Play only if your identity has at least (\d+) printed hit points\./i;
const gainsRegex = /gains? the \[\[([^\]]+)\]\] trait/i;

const resourceKeyPreifx = "resource_";

const traitJoinPattern = "(?:,? or |,? and | character and an? |, )";
const traitJoinRegex = new RegExp(traitJoinPattern, "i");

const charSet = openFontSync(
  "./docs/styles/fonts/BackIssuesBB_reg.otf",
).characterSet;

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
    .filter((entry) => entry.card_set_type_name_code === undefined)
    .filter((entry) => !entry.text.match(linkedRegex))
    .sort((c1, c2) => c1.code.localeCompare(c2.code))
    .map((entry) => buildCard(entry, traitLockRegex));

  const cards = deduplicate(cardsWithDuplicates).sort((c1, c2) =>
    c1.id.localeCompare(c2.id),
  );

  await Promise.all(cards.map((card) => fetchImage(card, force)));
  warnAboutMissingImages(cards);

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
    hero.exludedDeckCards ||= [];
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
          hero.exludedDeckCards.push({
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
    .map(({ name, alterEgo, hp, traits, exludedDeckCards }) => {
      const traitKeys = [...new Set(traits).intersection(traitLocks)];
      return { name, alterEgo, hp, traitKeys, exludedDeckCards };
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
    resources: parseResources(entry),
    traits: parseTraits(entry),
    traitLocks: parseTraitLocks(entry, traitLockRegex),
    teamUp: parseTeamUp(entry),
    minHp: parseMinHp(entry),
    isLandscape: entry.type_code === "player_side_scheme",
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
  if (!name) {
    return null;
  }
  name = nameFixes[name] || name;
  checkCharacters(name);
  return name
    .replace(/(?<=^| )"/, "“")
    .replace(/"(?=$| )/, "”")
    .replace(/(?<=^| )'/, "‘")
    .replaceAll("'", "’");
}

function checkCharacters(name) {
  const chars = name.split("");
  const unsupportedChars = chars.filter(
    (char) => !charSet.includes(char.charCodeAt(0)),
  );
  if (unsupportedChars.length > 0) {
    console.warn(
      styleText(
        "yellow",
        `"${name}" has unsupported characters: ${unsupportedChars.join(", ")}`,
      ),
    );
  }
}

function parseResources(entry) {
  return Object.entries(entry)
    .filter(([key, value]) => key.startsWith(resourceKeyPreifx) && value > 0)
    .map(([key, _]) => key.substring(resourceKeyPreifx.length).toUpperCase());
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
  card.imgSrc = imgSrc(outputPath);

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
    card.imgSrc = fallbackImgSrc;
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

  console.log(styleText("green", `Downloaded image for ${name} (${id})`));
}

function imgSrc(path) {
  return "/" + relative("docs", path);
}

function warnAboutMissingImages(cards) {
  const cardsWithMissingImages = cards.filter(
    (card) => card.imgSrc === fallbackImgSrc,
  );

  if (cardsWithMissingImages.length === 0) {
    return;
  }

  const packsWithMissingImages = distinct(
    cardsWithMissingImages.flatMap((card) => card.packs),
  );

  const messageParts = [
    "Missing images for:",
    ...cardsWithMissingImages
      .map((card) => `${card.name} (${card.id})`)
      .map(messageListItem),
    "From packs:",
    ...packsWithMissingImages.map(messageListItem),
  ];

  console.log(styleText("yellow", messageParts.join("\n")));
}

function messageListItem(text, i) {
  const number = (i + 1).toString().padStart(4, " ");
  return `${number}. ${text}`;
}

function distinct(array) {
  return [...new Set(array)];
}
