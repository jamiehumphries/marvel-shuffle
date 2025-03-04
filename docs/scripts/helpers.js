import { hashes } from "./hashes.js?v=768fd0b3";

export function chooseRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function filter(array, toRemove) {
  return array.filter((el) => !toRemove.includes(el));
}

export function flatten(cardsOrSets) {
  return cardsOrSets.flatMap((cardOrSet) => cardOrSet.children || [cardOrSet]);
}

export function getSlug(...names) {
  return names
    .join()
    .toLowerCase()
    .replaceAll(/[’\.]/g, "") // Remove apostrophes and full stops.
    .replaceAll(/[^a-zA-Z0-9]+/g, "-") // Replace all non-word characters with "-".
    .replaceAll(/(^\-+|\-+$)/g, ""); // Strip any leading and trailing "-".
}

export function image(type, ...pathParts) {
  const path = ["/images", type.slug, ...pathParts].join("/");
  const hash = hashes[path];
  return hash ? `${path}?v=${hash}` : type.placeholderImageSrc;
}

export function requestPostAnimationFrame(callback) {
  requestAnimationFrame(() => {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = callback;
    port2.postMessage(undefined);
  });
}
