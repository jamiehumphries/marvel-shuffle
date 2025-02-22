import { execSync } from "child_process";
import { createHash } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { globSync } from "glob";
import { resolve } from "path";
import { replaceInFileSync } from "replace-in-file";

function updateImages(noLevel) {
  const types = ["scenario", "modular", "hero", "aspect"];
  const directories = types.map((type) => "docs/images/" + type);
  const args = directories.join(" ");

  const files = execSync(
    `git ls-files --modified --others --exclude-standard ${args}`,
  )
    .toString()
    .trim()
    .split("\n")
    .filter((file) => existsSync(file));

  for (const file of files) {
    console.log(`Updating ${file}`);
    execSync(
      `convert ${file} \
        -adaptive-resize 294x418^ \
        -gravity center -crop 294x418+0+0 +repage \
        -matte mask.png -compose DstIn -composite \
        ${noLevel ? "" : "-level 50%"} \
        ${file}`,
    );
    execSync(`git add ${file}`);
  }

  updateImageHashes();
}

function updateImageHashes() {
  const images = globSync("docs/images/*/**/*.png", { withFileTypes: true });

  const hashes = Object.fromEntries(
    images.map((image) => {
      const { parentPath, name } = image;
      const path = resolve(parentPath, name);

      const pathParts = path.split("/");
      const imagesRootIndex = pathParts.lastIndexOf("images");
      const url = "/" + pathParts.splice(imagesRootIndex).join("/");

      const hash = computeHash(path);

      return [url, hash];
    }),
  );

  const hashesJs = JSON.stringify(hashes, null, 2);
  const outputFile = "docs/scripts/hashes.js";

  writeFileSync(outputFile, `export const hashes = ${hashesJs}`);
  execSync(`npx prettier --write ${outputFile}`);
  execSync(`git add ${outputFile}`);
}

function updateAssetVersions() {
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
  const regex = new RegExp(`(?<=${nameForRegex}\\?v=)[0-9a-f]+`, "g");

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

export { updateImages, updateImageHashes, updateAssetVersions };
