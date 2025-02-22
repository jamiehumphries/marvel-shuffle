import { updateImages } from "./helpers.js";

const noLevel = process.argv[2] === "--no-level";

updateImages(noLevel);
