import { execSync } from "child_process";
import { replaceInFileSync } from "replace-in-file";

const level = process.argv[2] || "patch";

const $ = (command) => execSync(command).toString().trim();

console.time("Release");

$("git stash --include-untracked --quiet");

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

const hasStash = !!$("git stash list");
if (hasStash) {
  $("git stash pop --index --quiet");
}

console.timeEnd("Release");
