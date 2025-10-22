import { execSync } from "child_process";
import { exit } from "process";
import { replaceInFileSync } from "replace-in-file";
import { styleText } from "util";

const level = process.argv[2] || "patch";

const $ = (command) => execSync(command).toString().trim();

const hasChanges = $("git status --porcelain") !== "";
if (hasChanges) {
  abort("Cannot release when there are uncommitted changes.");
}

const branch = $("git branch --show-current");
if (branch !== "main") {
  abort(`Cannot build release from '${branch}' branch (must be on 'main').`);
}

console.time("Release");

const version = $(`npm version ${level} --no-git-tag-version`);

console.log(`Building ${version}\n`);

replaceInFileSync({
  files: "docs/**/index.html",
  from: /(?<=<meta name="version" content=")\d+\.\d+\.\d+(?=" \/>)/,
  to: version.substring(1),
});

$("git add --all");
$(`git commit --message="Build ${version}"`);

$("npm run build");
$("git add --all");

$("git branch --force release HEAD");

const tree = $("git write-tree");
const commit = $(`git commit-tree ${tree} -p release -m "Release ${version}"`);
$(`git update-ref refs/heads/release ${commit}`);
$(`git tag --force ${version} release`);

$("git reset --hard");

console.timeEnd("Release");

function abort(message) {
  console.error(styleText("red", message + "\n"));
  execSync("git status", { stdio: "inherit" });
  exit();
}
