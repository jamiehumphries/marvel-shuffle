import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getFirestore,
  doc,
  collection,
  addDoc,
  getDoc,
  setDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

const app = initializeApp({
  apiKey: "AIzaSyBFYZluS920mE0zo85Qg4TeoTRYPXNJO3Y",
  authDomain: "marvel-shuffle.firebaseapp.com",
  projectId: "marvel-shuffle",
  storageBucket: "marvel-shuffle.appspot.com",
  messagingSenderId: "280392379599",
  appId: "1:280392379599:web:f72ad527a7f46f97571bba",
});

const USER_ID_KEY = "--user-id";
const syncUrlElement = document.getElementById("sync-url");

const db = getFirestore(app);
const users = collection(db, "users");

window.pendingUpdates = null;
window.updateTimeoutId = null;

async function initializeStorage() {
  const userDoc = getUserDoc();
  if (!userDoc) {
    return;
  }
  localStorage.clear();
  await setUserId(userDoc.id);
  const snapshot = await getDoc(userDoc);
  const data = snapshot.data() || {};
  for (const [key, value] of Object.entries(data)) {
    localStorage.setItem(key, value);
  }
}

async function clearStorage() {
  localStorage.clear();
  const userDoc = getUserDoc();
  if (userDoc) {
    await deleteDoc(userDoc);
  }
}

async function getSyncUrl() {
  let userId = getUserId();
  if (!userId) {
    const doc = await addDoc(users, { ...localStorage });
    userId = await setUserId(doc.id);
  }
  const url = new URL(window.location.origin);
  url.searchParams.append("id", userId);
  return url;
}

function getUserDoc() {
  const userId = getUserId();
  return userId ? doc(users, userId) : null;
}

function getUserId() {
  return localStorage.getItem(USER_ID_KEY);
}

async function setUserId(value) {
  localStorage.setItem(USER_ID_KEY, value);
  if (syncUrlElement) {
    syncUrlElement.innerText = await getSyncUrl();
  }
  return value;
}

function getItem(key) {
  return JSON.parse(localStorage.getItem(key));
}

function setItem(key, value) {
  value = JSON.stringify(value);
  localStorage.setItem(key, value);
  updateDb(key, value);
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

export {
  initializeStorage,
  clearStorage,
  getSyncUrl,
  getItem,
  setItem,
  setUserId,
};
