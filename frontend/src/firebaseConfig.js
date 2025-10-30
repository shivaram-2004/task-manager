import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 


// Import the functions you need from the SDKs you need

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2CRXgJt-mYTzlG_BV1EVp9nHkiQryYI4",
  authDomain: "taskmanager-4e07d.firebaseapp.com",
  projectId: "taskmanager-4e07d",
  storageBucket: "taskmanager-4e07d.firebasestorage.app",
  messagingSenderId: "787673173053",
  appId: "1:787673173053:web:65348d9cc22fe192beae54"
};

// Initialize Firebase


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

