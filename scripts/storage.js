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

const USER_ID_KEY = "id";

const app = initializeApp({
  apiKey: "AIzaSyBFYZluS920mE0zo85Qg4TeoTRYPXNJO3Y",
  authDomain: "marvel-shuffle.firebaseapp.com",
  projectId: "marvel-shuffle",
  storageBucket: "marvel-shuffle.appspot.com",
  messagingSenderId: "280392379599",
  appId: "1:280392379599:web:f72ad527a7f46f97571bba",
});

const db = getFirestore(app);
const users = collection(db, "users");

async function initializeStorage() {
  const userDoc = getUserDoc();
  if (!userDoc) {
    return;
  }

  localStorage.clear();
  setUserId(userDoc.id);
  const snapshot = await getDoc(userDoc);
  const data = snapshot.data() || {};
  await setDoc(userDoc, { "--last-used": new Date() }, { merge: true });
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
    userId = setUserId(doc.id);
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

function setUserId(value) {
  localStorage.setItem(USER_ID_KEY, value);
  getSyncUrl().then(
    (url) => (document.getElementById("sync-url").innerText = url)
  );
  return value;
}

function getItem(key) {
  return JSON.parse(localStorage.getItem(key));
}

function setItem(key, value) {
  value = JSON.stringify(value);
  localStorage.setItem(key, value);
  const userDoc = getUserDoc();
  if (userDoc) {
    setDoc(userDoc, Object.fromEntries([[key, value]]), { merge: true });
  }
}

export {
  initializeStorage,
  clearStorage,
  getSyncUrl,
  getItem,
  setItem,
  setUserId,
};
