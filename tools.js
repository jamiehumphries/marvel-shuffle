import { execSync } from "child_process";
import { createHash } from "crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "fs";
import { globSync } from "glob";
import { imageSize } from "image-size";
import { relative, resolve } from "path";
import { replaceInFileSync } from "replace-in-file";

const root = import.meta.dirname;
const imagesPath = "docs/images";
const imageGlobToExt = `${imagesPath}/*/**/{front,back,front-inner,back-inner}`;

export function updateImages(force = false) {
  const sourceRepository = resolve("../marvel-shuffle-images");
  if (!existsSync(sourceRepository)) {
    console.error("Could not find image source repository.");
    console.error(`Expected path: ${sourceRepository}`);
    return;
  }

  const sourceImages = `${sourceRepository}/${imageGlobToExt}.{ffg,scan}.{png,tiff}`;

  const files = globSync(sourceImages, { withFileTypes: true });
  for (const file of files) {
    const { parentPath, name: sourceName } = file;

    const sourcePath = resolve(parentPath, sourceName);
    const [name, type, ext] = sourceName.split(".");

    const outputName = `${name}.png`;
    const outputParentPath = parentPath.replace(sourceRepository, root);
    const outputPath = resolve(outputParentPath, outputName);

    if (!force && existsSync(outputPath)) {
      continue;
    }

    const relativePath = relative(root, outputPath);
    console.log(`Converting ${relativePath}`);

    const sourceImage = readFileSync(sourcePath);
    const { width, height } = imageSize(sourceImage);

    if (type === "scan" && ext === "tiff") {
      const tempName = `${name}.temp.tiff`;
      const tempPath = resolve(parentPath, tempName);
      execSync(`tiffcp ${sourcePath} ${tempPath}`);
      renameSync(tempPath, sourcePath);
    }

    mkdirSync(outputParentPath, { recursive: true });

    execSync(
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

    execSync(`git add ${outputPath}`);
  }
}

export function updateImageHashes() {
  const imagePatterns = [
    `${imagesPath}/campaign/*.png`,
    `${imageGlobToExt}.png`,
  ];

  const docsPath = resolve("docs");
  const entries = globSync(imagePatterns, { withFileTypes: true })
    .map((file) => {
      const { parentPath, name } = file;
      const path = resolve(parentPath, name);
      const url = "/" + relative(docsPath, path);
      const hash = computeHash(path);
      return [url, hash];
    })
    .sort(([url1], [url2]) => url1.localeCompare(url2));

  const hashes = Object.fromEntries(entries);
  const hashesJson = JSON.stringify(hashes, null, 2);
  const outputFile = "docs/scripts/data/hashes.js";

  writeFileSync(outputFile, `export const hashes = ${hashesJson}`);
  execSync(`npx prettier --write ${outputFile}`);
  execSync(`git add ${outputFile}`);
}

export function updateAssetVersions() {
  const assets = globSync("docs/**/*.{css,js}", { withFileTypes: true });
  const results = assets.map((asset) => updateAssetVersion(asset));
  const anyHasChanged = results.some((result) => result.hasChanged);
  if (anyHasChanged) {
    updateAssetVersions(assets);
  }
}

function updateAssetVersion(asset) {
  const { parentPath, name } = asset;
  const nameForRegex = name.replace(".", "\\.");
  const regex = new RegExp(`(?<=/${nameForRegex}\\?v=)[0-9a-f]+`, "g");
  const path = resolve(parentPath, name);
  const hash = computeHash(path);
  const results = replaceInFileSync({
    files: "docs/**/*.{html,js}",
    from: regex,
    to: hash,
  });

  let hasChanged = false;
  for (const result of results) {
    if (!result.hasChanged) {
      continue;
    }
    execSync(`git add ${result.file} ${path}`);
    hasChanged = true;
  }

  return { hasChanged };
}

function computeHash(path) {
  const data = readFileSync(path);
  return createHash("md5").update(data).digest("hex").substring(0, 8);
}
