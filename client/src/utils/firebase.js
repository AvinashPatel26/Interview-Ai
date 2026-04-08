// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";



const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
    authDomain: "interviewit-caab2.firebaseapp.com",
    projectId: "interviewit-caab2",
    storageBucket: "interviewit-caab2.firebasestorage.app",
    messagingSenderId: "728461366975",
    appId: "1:728461366975:web:a46ee14ed31ea7b9c1180a"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();
export { auth, provider };
// console.log("API Key:", import.meta.env.VITE_FIREBASE_APIKEY);