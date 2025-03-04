import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  addDoc,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBFYZluS920mE0zo85Qg4TeoTRYPXNJO3Y",
  authDomain: "marvel-shuffle.firebaseapp.com",
  projectId: "marvel-shuffle",
  storageBucket: "marvel-shuffle.appspot.com",
  messagingSenderId: "280392379599",
  appId: "1:280392379599:web:f72ad527a7f46f97571bba",
});

const LOCAL_KEY_PREFIX = "marvel-shuffle--";
const USER_ID_KEY = "--user-id";

const HAS_USER_ID = "has-user-id";

const db = getFirestore(app);
const users = collection(db, "users");

window.pendingUpdates = null;
window.updateTimeoutId = null;

async function initializeStorage() {
  const userDoc = getUserDoc();
  if (userDoc) {
    localStorage.clear();
    setUserId(userDoc.id);
    const snapshot = await getDoc(userDoc);
    const data = snapshot.data() || {};
    for (const [key, value] of Object.entries(data)) {
      localStorage.setItem(LOCAL_KEY_PREFIX + key, value);
    }
  }
  runMigrations();
}

async function clearStorage() {
  localStorage.clear();
  const userDoc = getUserDoc();
  if (userDoc) {
    await deleteDoc(userDoc);
  }
}

async function createBookmarkUrl() {
  const localPrefixPattern = new RegExp("^" + LOCAL_KEY_PREFIX);
  const dataEntries = Object.entries(localStorage).filter(([key, _]) =>
    localPrefixPattern.test(key),
  );
  const data = Object.fromEntries(
    dataEntries.map(([key, value]) => [
      key.replace(localPrefixPattern, ""),
      value,
    ]),
  );
  const doc = await addDoc(users, data);
  setUserId(doc.id);
  return getBookmarkUrl();
}

async function getBookmarkUrl() {
  const userId = getUserId();
  if (!userId) {
    return null;
  }
  const url = new URL(window.location.origin);
  url.searchParams.append("id", userId);
  return url.toString();
}

function getUserDoc() {
  const userId = getUserId();
  return userId ? doc(users, userId) : null;
}

function getUserId() {
  return localStorage.getItem(USER_ID_KEY);
}

function setUserId(value) {
  localStorage.setItem(USER_ID_KEY, value);
  document.body.classList.add(HAS_USER_ID);
}

function clearUserId() {
  localStorage.removeItem(USER_ID_KEY);
  document.body.classList.remove(HAS_USER_ID);
}

function getItem(key) {
  return JSON.parse(localStorage.getItem(LOCAL_KEY_PREFIX + key));
}

function setItem(key, value, stringify = true) {
  if (stringify) {
    value = JSON.stringify(value);
  }
  localStorage.setItem(LOCAL_KEY_PREFIX + key, value);
  updateDb(key, value);
}

function removeItem(key) {
  localStorage.removeItem(LOCAL_KEY_PREFIX + key);
  updateDb(key, deleteField());
}

function updateDb(key, value) {
  const userDoc = getUserDoc();
  if (!userDoc) {
    return;
  }

  pendingUpdates ||= {};
  pendingUpdates[key] = value;

  if (updateTimeoutId !== null) {
    clearTimeout(updateTimeoutId);
  }

  updateTimeoutId = setTimeout(() => {
    pendingUpdates["--updated-at"] = new Date();
    setDoc(userDoc, pendingUpdates, { merge: true });
    pendingUpdates = null;
    updateTimeoutId = null;
  }, 500);
}

function runMigrations() {
  let id = 1;
  rename("black-panther", "black-panther-tchalla", id++);
  rename("forced", "setting--forced", id++);
  rename("module", "modular", id++);
  remove("modular--prelates", id++);
  remove("modular--hope-summers", id++);
}

function rename(oldName, newName, migrationId) {
  migrate(migrationId, () => {
    const oldNameRegex = new RegExp(`${oldName}(?=(?:$|--|"))`, "g");
    for (let [key, value] of Object.entries(localStorage)) {
      key = key.slice(LOCAL_KEY_PREFIX.length);
      if (oldNameRegex.test(key)) {
        const newKey = key.replaceAll(oldNameRegex, newName);
        setItem(newKey, value, false);
        removeItem(key);
        key = newKey;
      }
      if (oldNameRegex.test(value)) {
        const newValue = value.replaceAll(oldNameRegex, newName);
        setItem(key, newValue, false);
      }
    }
  });
}

function remove(key, migrationId) {
  migrate(migrationId, () => removeItem(key));
}

function migrate(migrationId, callback) {
  const migrationKey = `migration--${migrationId.toString().padStart(4, "0")}`;
  const hasMigrated = getItem(migrationKey);
  if (hasMigrated) {
    return;
  }
  callback();
  setItem(migrationKey, true);
}

export {
  clearStorage,
  clearUserId,
  createBookmarkUrl,
  getBookmarkUrl,
  getItem,
  initializeStorage,
  setItem,
  setUserId,
};
