import { execSync } from "child_process";

const files = execSync("git ls-files --others --exclude-standard docs/images/")
  .toString()
  .trim()
  .split("\n");

for (const file of files) {
  execSync(`convert ${file} -matte mask.png -compose DstIn -composite ${file}`);
}
