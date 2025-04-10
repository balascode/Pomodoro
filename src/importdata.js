require('dotenv').config(); // Load .env variables
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const dummyData = require('./dummydata.json');

const firebaseConfig = {
  apiKey: "AIzaSyCzqxG89CQdPVj1swyYrU48x5e7AuAHzBg",
  authDomain: "pomodoro-79638.firebaseapp.com",
  projectId: "pomodoro-79638",
  storageBucket: "pomodoro-79638.appspot.com",
  messagingSenderId: "914562877254",
  appId: "1:914562877254:web:a102d42001fc535dd0c747",
  measurementId: "G-PW530S1N5Z"
};
console.log('Firebase Config:', firebaseConfig); // Debug config

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const importData = async () => {
  const userId = 'CXdNBwS71lTCmoU5kk8YKCC5eAi1';
  const userData = dummyData.users[userId];
  
  // Check if userData exists
  if (!userData) {
    throw new Error(`No data found for userId: ${userId} in dummydata.json`);
  }
  console.log('User Data:', userData);

  // Set user profile
  console.log('Writing user profile to:', `users/${userId}`);
  await setDoc(doc(db, 'users', userId), {
    name: userData.name,
    email: userData.email,
    createdAt: new Date(userData.createdAt),
    settings: userData.settings,
  }, { merge: true });
  console.log('User profile written');

  // Check if stats exists
  if (!userData.stats || typeof userData.stats !== 'object') {
    throw new Error('Stats data is missing or invalid in dummydata.json');
  }

  // Set stats
  for (const [date, stat] of Object.entries(userData.stats)) {
    console.log('Writing stats to:', `users/${userId}/stats/${date}`, 'Data:', stat);
    await setDoc(doc(db, 'users', userId, 'stats', date), {
      date: stat.date,
      cycles: stat.cycles,
      workDuration: stat.workDuration,
      breakDuration: stat.breakDuration,
      createdAt: new Date(stat.createdAt),
      lastUpdated: new Date(stat.lastUpdated),
    });
    console.log(`Stats for ${date} written`);
  }
  console.log('Dummy data imported successfully');
};

importData().catch(error => console.error('Import failed:', error));