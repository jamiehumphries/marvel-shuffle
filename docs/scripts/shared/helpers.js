export const BASIC = "Basic";

export function canIncludeSuggestedCard(card, hero, allowedAspects) {
  return (
    (card.aspect !== BASIC || allowedAspects.includes(BASIC)) &&
    (card.minHp === null || hero.hp >= card.minHp) &&
    passesRestriction(card.identityLocks, [hero.name, hero.subname]) &&
    passesRestriction(card.traitLocks, hero.traits) &&
    ![hero, ...hero.exludedDeckCards].some((c2) => violatesUnique(card, c2)) &&
    (allowedAspects.includes(card.aspect) || hero.include(card))
  );
}

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
  return ensureArray(cardsOrSets).flatMap((cardOrSet) =>
    cardOrSet.children ? flatten(cardOrSet.children) : [cardOrSet],
  );
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

export function sum(array, valueSelector) {
  return array.reduce((count, item) => count + valueSelector(item), 0);
}

export function violatesUnique(card1, card2) {
  return (
    (card1.name === card2.name &&
      (card1.subname === null ||
        card2.subname === null ||
        card1.subname === card2.subname)) ||
    (card1.subname === null && card1.name === card2.subname) ||
    (card2.subname === null && card2.name === card1.subname)
  );
}
