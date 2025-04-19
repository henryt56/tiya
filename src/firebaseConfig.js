// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDGF2Aht2AbzW0ZEe8xVWtIT2BLDnVIPRc",
  authDomain: "tiya-tutoring.firebaseapp.com",
  projectId: "tiya-tutoring",
  storageBucket: "tiya-tutoring.firebasestorage.app",
  messagingSenderId: "894845891073",
  appId: "1:894845891073:web:4cb886ea4046792bd8c600",
  measurementId: "G-1P4NFNHEYF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };