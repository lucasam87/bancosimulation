import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDG4ea9cWX6Ph4W_3MdDGhAon0vO_xOgvk",
    authDomain: "projeto-banco-ef92a.firebaseapp.com",
    projectId: "projeto-banco-ef92a",
    storageBucket: "projeto-banco-ef92a.firebasestorage.app",
    messagingSenderId: "468037832780",
    appId: "1:468037832780:web:791be192587946494224e9",
    measurementId: "G-4RV0XN7BBH"
};

import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
