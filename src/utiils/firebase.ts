// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDsOUNZqnytpWkyicRx5WDb8GmPOEiiUy4",
  authDomain: "whitetusk-7bfa1.firebaseapp.com",
  databaseURL: "https://whitetusk-7bfa1-default-rtdb.firebaseio.com",
  projectId: "whitetusk-7bfa1",
  storageBucket: "whitetusk-7bfa1.firebasestorage.app",
  messagingSenderId: "452160426051",
  appId: "1:452160426051:web:cfb4d2d1252ddfc89644f6",
  measurementId: "G-T2KFYHDHZY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);
export const firestore = getFirestore(app);