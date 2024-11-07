// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";

//Admin
//EnergiaBolivia

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDaq1SH6X_MKdr0QTX2p57CHJcWeWX1W00",
  authDomain: "transachain.firebaseapp.com",
  projectId: "transachain",
  storageBucket: "transachain.appspot.com",
  messagingSenderId: "98588303425",
  appId: "1:98588303425:web:6cbd947e56e37645b326c0",
  measurementId: "G-DWX4ENTG05"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const functions = getFunctions(app);

export { db, storage, auth, functions };

