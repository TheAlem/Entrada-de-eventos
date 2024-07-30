// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAWXhiuqi2PROqRtLS19mvqkZ1UjUEhvbE",
    authDomain: "ticket-ecommerce-and-check-in.firebaseapp.com",
    projectId: "ticket-ecommerce-and-check-in",
    storageBucket: "ticket-ecommerce-and-check-in.appspot.com",
    messagingSenderId: "415899570790",
    appId: "1:415899570790:web:a563af6db4135bc6cb13a7",
    measurementId: "G-24J09Q19QT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);