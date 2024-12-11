import { execSync } from "child_process";
import { createHash } from "crypto";
import { readFileSync } from "fs";
import { globSync } from "glob";
import { resolve } from "path";
import { replaceInFileSync } from "replace-in-file";

const level = process.argv[2] || "patch";

execSync("git stash --include-untracked --quiet");

const version = execSync(`npm version ${level} --no-git-tag-version`)
  .toString()
  .trim();

console.log(`Building ${version}`);
console.log();

const assets = globSync("docs/**/*.{css,js}", { withFileTypes: true });
updateVersions(assets);

execSync(`git commit --all --message="Build ${version}"`);
execSync(`git tag ${version}`);

try {
  execSync("git stash pop --index --quiet");
} catch {}

function updateVersions(assets) {
  const results = assets.map((asset) => updateVersion(asset));
  const anyHasChanged = results.some((result) => result.hasChanged);
  if (anyHasChanged) {
    updateVersions(assets);
  }
}

function updateVersion(asset) {
  const { parentPath, name } = asset;

  const nameForRegex = name.replace(".", "\\.");
  const regex = new RegExp(`(?<=${nameForRegex}\\?v=)[0-9a-f]+`, "g");

  const path = resolve(parentPath, name);
  const data = readFileSync(path);
  const hash = createHash("md5").update(data).digest("hex").substring(0, 8);

  const results = replaceInFileSync({
    files: "docs/**/*.{html,js}",
    from: regex,
    to: hash,
  });

  const hasChanged = results.some((result) => result.hasChanged);
  return { hasChanged };
}
