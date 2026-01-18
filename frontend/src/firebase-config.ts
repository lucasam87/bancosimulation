import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyBuIY8VGsrUco7YbCeydVE4AuDsQv3NZgc",
    authDomain: "bancosimu-ab41e.firebaseapp.com",
    projectId: "bancosimu-ab41e",
    storageBucket: "bancosimu-ab41e.firebasestorage.app",
    messagingSenderId: "863729132905",
    appId: "1:863729132905:web:71cc647ea9315fd98449f8",
    measurementId: "G-18S9LBS2KJ"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
