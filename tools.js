import { execSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { globSync } from "glob";
import { imageSize } from "image-size";
import { relative, resolve } from "path";
import { replaceInFileSync } from "replace-in-file";

export function updateImages() {
  const imagePattern = "docs/images/*/**/*.{ffg,ffg-wm,scan}.png";

  const files = globSync(imagePattern, { withFileTypes: true });
  for (const file of files) {
    const { parentPath, name: sourceName } = file;
    const sourcePath = resolve(parentPath, sourceName);
    const [name, _type, ext] = sourceName.split(".");
    const outputName = `${name}.${ext}`;
    const outputPath = resolve(parentPath, outputName);

    if (existsSync(outputPath)) {
      continue;
    }

    const relativePath = relative(import.meta.dirname, outputPath);
    console.log(`Converting ${relativePath}`);

    const sourceImage = readFileSync(sourcePath);
    const { width, height } = imageSize(sourceImage);

    execSync(
      `convert ${sourcePath} \
        ${width > height ? "-rotate 270" : ""} \
        -adaptive-resize 294x418^ \
        -gravity center -crop 294x418+0+0 +repage \
        -matte mask.png -compose DstIn -composite \
        ${outputPath}`,
    );

    execSync(`git add ${sourcePath} ${outputPath}`);
  }
}

export function updateImageHashes() {
  const imagePatterns = [
    "docs/images/campaign/*.png",
    "docs/images/*/**/{front,back,front-inner,back-inner}.png",
  ];

  const entries = globSync(imagePatterns, { withFileTypes: true })
    .map((file) => {
      const { parentPath, name } = file;
      const path = resolve(parentPath, name);
      const pathParts = path.split("/");
      const imagesRootIndex = pathParts.lastIndexOf("images");
      const url = "/" + pathParts.splice(imagesRootIndex).join("/");
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
