import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { 
  getFirestore, 
  enableIndexedDbPersistence, 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB7tEOkv4QG-nEnJ5hNJVPr2hlEcV4lrFM",
  authDomain: "soloparent-9f47e.firebaseapp.com",
  projectId: "soloparent-9f47e",
  storageBucket: "soloparent-9f47e.appspot.com", // Fixed typo
  messagingSenderId: "493387045091",
  appId: "1:493387045091:web:594ce857bd80dad9024dd6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Enable Firestore Offline Mode
enableIndexedDbPersistence(db)
  .then(() => {
    console.log("Firestore offline mode enabled");
  })
  .catch((err) => {
    console.error("Offline persistence failed:", err);
  });

export { auth, db, signInWithEmailAndPassword, doc, getDoc, collection, addDoc, getDocs };
