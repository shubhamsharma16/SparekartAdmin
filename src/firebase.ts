// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD6tlrfvcWlmsYKcknXE7cZ6oZmI__jKA0",
  authDomain: "sparekart-4a1e9.firebaseapp.com",
  projectId: "sparekart-4a1e9",
  storageBucket: "sparekart-4a1e9.appspot.com",
  messagingSenderId: "569878983991",
  appId: "1:569878983991:web:d582199613c25316d8d6b2",
  measurementId: "G-J1DNG7ZS1X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export { db };