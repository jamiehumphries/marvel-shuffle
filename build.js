import {
  updateAssetVersions,
  updateImageHashes,
  updateImages,
} from "./tools.js";

const args = process.argv.slice(2).map((arg) => arg.slice(2));

if (args.includes("images")) {
  updateImages();
}

if (args.includes("hashes")) {
  updateImageHashes();
}

if (args.includes("assets")) {
  updateAssetVersions();
}
