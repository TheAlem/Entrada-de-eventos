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
    apiKey: "AIzaSyDi_hFczoHVQZ38-esXozxDXtUdbPsQ50c",
    authDomain: "energiaboliviappandroid.firebaseapp.com",
    projectId: "energiaboliviappandroid",
    storageBucket: "energiaboliviappandroid.appspot.com",
    messagingSenderId: "547502490821",
    appId: "1:547502490821:web:07b7c381648edcd4b75cac",
    measurementId: "G-1QG1R84PEH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const functions = getFunctions(app);

export { db, storage, auth, functions };