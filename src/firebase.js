import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCzqxG89CQdPVj1swyYrU48x5e7AuAHzBg",
  authDomain: "pomodoro-79638.firebaseapp.com",
  projectId: "pomodoro-79638",
  storageBucket: "pomodoro-79638.appspot.com",
  messagingSenderId: "914562877254",
  appId: "1:914562877254:web:a102d42001fc535dd0c747",
  measurementId: "G-PW530S1N5Z"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable persistence before any other Firestore operations
enableIndexedDbPersistence(db).catch((err) => {
  console.log('Persistence error:', err.code === 'failed-precondition' ? 'Multiple tabs open?' : err.message);
});

export { app, auth, db };