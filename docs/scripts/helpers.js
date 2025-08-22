export function chooseRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function ensureArray(possibleArray) {
  return Array.isArray(possibleArray) ? possibleArray : [possibleArray];
}

export function filter(array, toRemove) {
  toRemove = ensureArray(toRemove);
  return array.filter((el) => !toRemove.includes(el));
}

export function flatten(cardsOrSets) {
  return cardsOrSets.flatMap((cardOrSet) => cardOrSet.children || [cardOrSet]);
}

export function passesRestriction(restrictedValues, testValues) {
  if (restrictedValues === null) {
    return true;
  }
  const restrictedSet = new Set(restrictedValues);
  return [...testValues].some((item) => restrictedSet.has(item));
}

export function requestPostAnimationFrame(callback) {
  requestAnimationFrame(() => {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = callback;
    port2.postMessage(undefined);
  });
}
