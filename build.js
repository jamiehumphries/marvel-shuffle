import { execSync } from "child_process";
import { updateAssetVersions, updateImageHashes } from "./tools.js";

const level = process.argv[2]?.slice(2) || "patch";

execSync("git stash --include-untracked --quiet");

const version = execSync(`npm version ${level} --no-git-tag-version`)
  .toString()
  .trim();

console.log(`Building ${version}`);
console.log();

updateImageHashes();
updateAssetVersions();

execSync("git add package.json package-lock.json");
execSync(`git commit --message="Build ${version}"`);
execSync(`git tag --force ${version}`);

try {
  execSync("git stash pop --index --quiet");
} catch {}
