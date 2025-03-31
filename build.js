import { importAllDeckCards } from "./import.js";
import {
  updateAssetVersions,
  updateImageHashes,
  updateImages,
} from "./tools.js";

const args = process.argv.slice(2);

console.time("Build");

if (args.includes("deck")) {
  await importAllDeckCards(args.includes("--force"));
}

if (args.includes("images")) {
  await updateImages(args.includes("--force"));
}

if (args.includes("hashes")) {
  await updateImageHashes();
}

if (args.includes("assets")) {
  await updateAssetVersions();
}

console.timeEnd("Build");
