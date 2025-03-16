export function remove(key) {
  return ["remove", key];
}

export function rename(oldName, newName) {
  return ["rename", oldName, newName];
}
