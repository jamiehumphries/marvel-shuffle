import { exec as _exec } from "child_process";
import { createHash } from "crypto";
import { access, mkdir, readFile, rename, writeFile } from "fs/promises";
import { glob } from "glob";
import { imageSize } from "image-size";
import { parse, relative, resolve } from "path";
import { format } from "prettier";
import { replaceInFile } from "replace-in-file";
import { promisify } from "util";

const root = import.meta.dirname;
const imagesPath = "docs/images";
const imageGlobToExt = `${imagesPath}/*/**/{front,back,front-inner,back-inner}`;
const imageSourceRepo = resolve("../marvel-shuffle-images");

export const exec = promisify(_exec);

export const exists = (path) =>
  access(path)
    .then(() => true)
    .catch(() => false);

export async function updateImages(force = false) {
  const imageSourceRepoExists = await exists(imageSourceRepo);
  if (!imageSourceRepoExists) {
    console.error("Could not find image source repository.");
    console.error(`Expected path: ${imageSourceRepo}`);
    return;
  }

  const sourceImages = `${imageSourceRepo}/${imageGlobToExt}.{ffg,scan}.{png,tiff}`;
  const files = await glob(sourceImages, { withFileTypes: true });
  await Promise.all(files.map((file) => updateImage(file, force)));

  await exec(`git add ${imagesPath}`);
}

async function updateImage(file, force) {
  const { parentPath, name: sourceName } = file;

  const sourcePath = resolve(parentPath, sourceName);
  const [name, type, ext] = sourceName.split(".");

  const outputName = `${name}.png`;
  const outputParentPath = parentPath.replace(imageSourceRepo, root);
  const outputPath = resolve(outputParentPath, outputName);

  if (!force && (await exists(outputPath))) {
    return;
  }

  const sourceImage = await readFile(sourcePath);
  const { width, height } = imageSize(sourceImage);

  if (type === "scan" && ext === "tiff") {
    const tempName = `${name}.temp.tiff`;
    const tempPath = resolve(parentPath, tempName);
    await exec(`tiffcp ${sourcePath} ${tempPath}`);
    await rename(tempPath, sourcePath);
  }

  await mkdir(outputParentPath, { recursive: true });

  await exec(
    `convert ${sourcePath} \
      -strip \
      ${width > height ? "-rotate 270" : ""} \
      -trim +repage \
      -resize 294x418^ \
      -gravity center -crop 294x418+0+0 +repage \
      -matte mask.png -compose DstIn -composite \
      ${type === "scan" ? "-level 5%" : ""} \
      ${outputPath}`,
  );

  const relativePath = relative(root, outputPath);
  console.log(`Converted ${relativePath}`);
}

export async function updateImageHashes() {
  const imagePatterns = [
    `${imagesPath}/campaign/*.png`,
    `${imageGlobToExt}.png`,
  ];

  const docsPath = resolve("docs");

  const imageFiles = await glob(imagePatterns, { withFileTypes: true });
  const entries = await Promise.all(
    imageFiles.map(async ({ parentPath, name }) => {
      const path = resolve(parentPath, name);
      const url = "/" + relative(docsPath, path);
      const hash = await computeHash(path);
      return [url, hash];
    }),
  );
  entries.sort(([url1], [url2]) => url1.localeCompare(url2));

  const hashes = Object.fromEntries(entries);
  const path = "docs/scripts/data/hashes.js";
  await writeCodeFile(path, hashes);
  await exec(`git add ${path}`);
}

export async function writeCodeFile(path, data) {
  const name = parse(path).name.replaceAll(/[^a-zA-Z0-9]+/g, "_");
  const json = JSON.stringify(data);
  const content = `export const ${name} = ${json}`;
  const formattedContent = await format(content, { parser: "babel" });
  await writeFile(path, formattedContent);
}

export async function updateAssetVersions() {
  const assets = await glob("docs/**/*.{css,js}", { withFileTypes: true });
  const results = await Promise.all(assets.map(updateAssetVersion));
  const anyHasChanged = results.some((result) => result.hasChanged);
  if (anyHasChanged) {
    await updateAssetVersions(assets);
  }
  await exec("git add docs");
}

async function updateAssetVersion(asset) {
  const { parentPath, name } = asset;
  const nameForRegex = name.replace(".", "\\.");
  const regex = new RegExp(`(?<=/${nameForRegex}\\?v=)[0-9a-f]+`, "g");
  const path = resolve(parentPath, name);
  const hash = await computeHash(path);
  const results = await replaceInFile({
    files: "docs/**/*.{html,js}",
    from: regex,
    to: hash,
  });

  let hasChanged = false;
  for (const result of results) {
    if (!result.hasChanged) {
      continue;
    }
    hasChanged = true;
  }

  return { hasChanged };
}

async function computeHash(path) {
  const data = await readFile(path);
  return createHash("md5").update(data).digest("hex").substring(0, 8);
}
