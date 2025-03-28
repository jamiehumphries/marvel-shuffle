export function remove(key) {
  return ["remove", key];
}

export function rename(oldName, newName) {
  return ["rename", oldName, newName];
}

export function setDefault(key, value) {
  return ["setDefault", key, value];
}
